#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

console.log('🔍 NETLIFY DEPLOYMENT DIAGNOSTICS\n');
console.log('Checking common causes of Netlify 404/"no index.html" problems...\n');

let passCount = 0;
let failCount = 0;
let fixCount = 0;

function pass(message) {
  console.log(`✅ PASS: ${message}`);
  passCount++;
}

function fail(message) {
  console.log(`❌ FAIL: ${message}`);
  failCount++;
}

function fix(message) {
  console.log(`🔧 FIXED: ${message}`);
  fixCount++;
}

function warn(message) {
  console.log(`⚠️  WARN: ${message}`);
}

function info(message) {
  console.log(`ℹ️  INFO: ${message}`);
}

// Check 1: package.json exists and has correct scripts
function checkPackageJson() {
  console.log('1. Checking package.json...');
  
  const packagePath = path.join(rootDir, 'package.json');
  if (!fs.existsSync(packagePath)) {
    fail('package.json not found at root');
    return;
  }
  
  try {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Check scripts
    const requiredScripts = {
      'dev': 'vite',
      'build': 'vite build',
      'preview': 'vite preview --port 4173'
    };
    
    let scriptsOk = true;
    for (const [script, expected] of Object.entries(requiredScripts)) {
      if (pkg.scripts?.[script] !== expected) {
        fail(`package.json script "${script}" should be "${expected}"`);
        scriptsOk = false;
      }
    }
    
    if (scriptsOk) {
      pass('package.json scripts are correct');
    }
    
    // Check Node version
    if (pkg.engines?.node && !pkg.engines.node.includes('18')) {
      warn('Consider updating engines.node to ">=18"');
    } else {
      pass('Node.js version requirement is appropriate');
    }
    
    // Check essential dependencies
    const requiredDeps = ['react', 'react-dom'];
    const requiredDevDeps = ['vite', '@vitejs/plugin-react', 'typescript'];
    
    let depsOk = true;
    for (const dep of requiredDeps) {
      if (!pkg.dependencies?.[dep]) {
        fail(`Missing dependency: ${dep}`);
        depsOk = false;
      }
    }
    
    for (const dep of requiredDevDeps) {
      if (!pkg.devDependencies?.[dep]) {
        fail(`Missing devDependency: ${dep}`);
        depsOk = false;
      }
    }
    
    if (depsOk) {
      pass('Essential dependencies are present');
    }
    
  } catch (error) {
    fail(`package.json is invalid JSON: ${error.message}`);
  }
}

// Check 2: index.html exists at root
function checkIndexHtml() {
  console.log('\n2. Checking index.html location...');
  
  const rootIndexPath = path.join(rootDir, 'index.html');
  const publicIndexPath = path.join(rootDir, 'public', 'index.html');
  
  if (!fs.existsSync(rootIndexPath)) {
    fail('index.html not found at root level');
    
    // Check if it's in public/ (common mistake)
    if (fs.existsSync(publicIndexPath)) {
      warn('Found index.html in public/ - this should be at root for Vite');
      try {
        fs.copyFileSync(publicIndexPath, rootIndexPath);
        fix('Copied index.html from public/ to root');
      } catch (error) {
        fail(`Failed to copy index.html: ${error.message}`);
      }
    }
  } else {
    pass('index.html exists at root level');
    
    // Check if there's also one in public/ (potential conflict)
    if (fs.existsSync(publicIndexPath)) {
      warn('Duplicate index.html found in public/ - removing to avoid conflicts');
      try {
        fs.unlinkSync(publicIndexPath);
        fix('Removed duplicate index.html from public/');
      } catch (error) {
        warn(`Could not remove public/index.html: ${error.message}`);
      }
    }
  }
  
  // Validate index.html content
  if (fs.existsSync(rootIndexPath)) {
    try {
      const content = fs.readFileSync(rootIndexPath, 'utf8');
      
      if (!content.includes('<div id="root">')) {
        fail('index.html missing React root div (#root)');
      } else {
        pass('index.html has React root div');
      }
      
      if (!content.includes('src="/src/main.tsx"') && !content.includes('src="/src/main.ts"')) {
        fail('index.html missing main.tsx/main.ts script reference');
      } else {
        pass('index.html has main script reference');
      }
      
    } catch (error) {
      fail(`Could not read index.html: ${error.message}`);
    }
  }
}

// Check 3: vite.config.ts
function checkViteConfig() {
  console.log('\n3. Checking vite.config.ts...');
  
  const configPath = path.join(rootDir, 'vite.config.ts');
  if (!fs.existsSync(configPath)) {
    fail('vite.config.ts not found');
    
    // Create basic config
    const basicConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // guarantee HTML entry so dist/index.html is emitted
      input: 'index.html'
    }
  }
})
`;
    
    try {
      fs.writeFileSync(configPath, basicConfig);
      fix('Created basic vite.config.ts');
    } catch (error) {
      fail(`Failed to create vite.config.ts: ${error.message}`);
    }
  } else {
    try {
      const content = fs.readFileSync(configPath, 'utf8');
      
      if (!content.includes('react')) {
        fail('vite.config.ts missing React plugin');
      } else {
        pass('vite.config.ts has React plugin');
      }
      
      if (!content.includes('input:') || !content.includes('index.html')) {
        warn('vite.config.ts should specify input: "index.html" for proper HTML generation');
      } else {
        pass('vite.config.ts has HTML input configured');
      }
      
    } catch (error) {
      fail(`Could not read vite.config.ts: ${error.message}`);
    }
  }
}

// Check 4: netlify.toml
function checkNetlifyToml() {
  console.log('\n4. Checking netlify.toml...');
  
  const tomlPath = path.join(rootDir, 'netlify.toml');
  if (!fs.existsSync(tomlPath)) {
    fail('netlify.toml not found');
    return;
  }
  
  try {
    const content = fs.readFileSync(tomlPath, 'utf8');
    
    if (!content.includes('command   = "npm run build"')) {
      fail('netlify.toml missing correct build command');
    } else {
      pass('netlify.toml has correct build command');
    }
    
    if (!content.includes('publish   = "dist"')) {
      fail('netlify.toml should publish "dist" directory');
    } else {
      pass('netlify.toml publishes dist directory');
    }
    
    if (!content.includes('functions = "netlify/functions"')) {
      fail('netlify.toml missing functions directory');
    } else {
      pass('netlify.toml has functions directory configured');
    }
    
    if (!content.includes('to   = "/index.html"')) {
      fail('netlify.toml missing SPA fallback redirect');
    } else {
      pass('netlify.toml has SPA fallback configured');
    }
    
  } catch (error) {
    fail(`Could not read netlify.toml: ${error.message}`);
  }
}

// Check 5: src/main.tsx exists
function checkMainEntry() {
  console.log('\n5. Checking main entry file...');
  
  const mainTsxPath = path.join(rootDir, 'src', 'main.tsx');
  const mainTsPath = path.join(rootDir, 'src', 'main.ts');
  
  if (fs.existsSync(mainTsxPath)) {
    pass('src/main.tsx exists');
    
    try {
      const content = fs.readFileSync(mainTsxPath, 'utf8');
      if (!content.includes('createRoot') && !content.includes('render')) {
        fail('src/main.tsx missing React render call');
      } else {
        pass('src/main.tsx has React render call');
      }
    } catch (error) {
      fail(`Could not read src/main.tsx: ${error.message}`);
    }
  } else if (fs.existsSync(mainTsPath)) {
    pass('src/main.ts exists');
  } else {
    fail('Neither src/main.tsx nor src/main.ts found');
  }
}

// Check 6: Build test
async function checkBuild() {
  console.log('\n6. Testing build process...');
  
  try {
    // Clean dist first
    const distPath = path.join(rootDir, 'dist');
    if (fs.existsSync(distPath)) {
      fs.rmSync(distPath, { recursive: true, force: true });
      info('Cleaned existing dist directory');
    }
    
    // Run build
    const { spawn } = await import('child_process');
    
    return new Promise((resolve) => {
      const buildProcess = spawn('npm', ['run', 'build'], {
        cwd: rootDir,
        stdio: 'pipe'
      });
      
      let output = '';
      let errorOutput = '';
      
      buildProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      buildProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      buildProcess.on('close', (code) => {
        if (code === 0) {
          // Check if dist/index.html was created
          const distIndexPath = path.join(rootDir, 'dist', 'index.html');
          if (fs.existsSync(distIndexPath)) {
            pass('Build successful - dist/index.html created');
            
            // Check dist/index.html content
            try {
              const distContent = fs.readFileSync(distIndexPath, 'utf8');
              if (distContent.includes('<script') && distContent.includes('assets/')) {
                pass('dist/index.html contains bundled assets');
              } else {
                warn('dist/index.html may be missing bundled assets');
              }
            } catch (error) {
              warn(`Could not verify dist/index.html content: ${error.message}`);
            }
          } else {
            fail('Build completed but dist/index.html not found');
          }
        } else {
          fail(`Build failed with exit code ${code}`);
          if (errorOutput) {
            console.log('Build errors:');
            console.log(errorOutput);
          }
        }
        resolve();
      });
    });
  } catch (error) {
    fail(`Build test failed: ${error.message}`);
  }
}

// Check 7: Functions structure
function checkFunctions() {
  console.log('\n7. Checking Netlify Functions...');
  
  const functionsDir = path.join(rootDir, 'netlify', 'functions');
  if (!fs.existsSync(functionsDir)) {
    warn('netlify/functions directory not found');
    return;
  }
  
  pass('netlify/functions directory exists');
  
  // Check for TikTok functions
  const expectedFunctions = [
    'complete_registration.js',
    'place_order.js', 
    'add_to_cart.js'
  ];
  
  for (const func of expectedFunctions) {
    const funcPath = path.join(functionsDir, func);
    if (fs.existsSync(funcPath)) {
      pass(`Function ${func} exists`);
    } else {
      warn(`Function ${func} not found`);
    }
  }
  
  // Check for shared library
  const libPath = path.join(functionsDir, 'tiktok', '_lib.js');
  if (fs.existsSync(libPath)) {
    pass('TikTok shared library exists');
  } else {
    warn('TikTok shared library (_lib.js) not found');
  }
}

// Check 8: Environment variables
function checkEnvVars() {
  console.log('\n8. Checking environment configuration...');
  
  const envExamplePath = path.join(rootDir, '.env.example');
  if (fs.existsSync(envExamplePath)) {
    pass('.env.example exists');
  } else {
    warn('.env.example not found - consider adding for documentation');
  }
  
  const envPath = path.join(rootDir, '.env');
  if (fs.existsSync(envPath)) {
    pass('.env file exists (for local development)');
    
    try {
      const envContent = fs.readFileSync(envPath, 'utf8');
      if (envContent.includes('TIKTOK_ACCESS_TOKEN')) {
        pass('TikTok access token configured locally');
      } else {
        warn('TIKTOK_ACCESS_TOKEN not found in .env');
      }
    } catch (error) {
      warn(`Could not read .env: ${error.message}`);
    }
  } else {
    info('.env not found (normal for production - use Netlify env vars)');
  }
}

// Check 9: .gitignore
function checkGitignore() {
  console.log('\n9. Checking .gitignore...');
  
  const gitignorePath = path.join(rootDir, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    warn('.gitignore not found');
    return;
  }
  
  try {
    const content = fs.readFileSync(gitignorePath, 'utf8');
    
    const requiredEntries = ['node_modules', 'dist', '.env'];
    let gitignoreOk = true;
    
    for (const entry of requiredEntries) {
      if (!content.includes(entry)) {
        fail(`.gitignore missing: ${entry}`);
        gitignoreOk = false;
      }
    }
    
    if (gitignoreOk) {
      pass('.gitignore has essential entries');
    }
    
  } catch (error) {
    fail(`Could not read .gitignore: ${error.message}`);
  }
}

// Check 10: TypeScript configuration
function checkTypeScript() {
  console.log('\n10. Checking TypeScript configuration...');
  
  const tsconfigPath = path.join(rootDir, 'tsconfig.json');
  if (fs.existsSync(tsconfigPath)) {
    pass('tsconfig.json exists');
  } else {
    warn('tsconfig.json not found - TypeScript compilation may fail');
  }
  
  const tsconfigAppPath = path.join(rootDir, 'tsconfig.app.json');
  if (fs.existsSync(tsconfigAppPath)) {
    pass('tsconfig.app.json exists');
  } else {
    warn('tsconfig.app.json not found');
  }
}

// Main diagnostic function
async function runDiagnostics() {
  console.log(`Running diagnostics from: ${rootDir}\n`);
  
  checkPackageJson();
  checkIndexHtml();
  checkViteConfig();
  checkNetlifyToml();
  checkMainEntry();
  await checkBuild();
  checkFunctions();
  checkEnvVars();
  checkGitignore();
  checkTypeScript();
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${passCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`🔧 Fixed: ${fixCount}`);
  
  if (failCount === 0) {
    console.log('\n🎉 ALL CHECKS PASSED! Your site should deploy successfully to Netlify.');
    console.log('\nNext steps:');
    console.log('1. Commit your changes');
    console.log('2. Push to your Git repository');
    console.log('3. Connect to Netlify and deploy');
    console.log('4. Set environment variables in Netlify dashboard');
  } else {
    console.log('\n⚠️  ISSUES FOUND! Please fix the failed checks before deploying.');
    console.log('\nCommon fixes:');
    console.log('- Ensure index.html is at root level');
    console.log('- Check package.json scripts match requirements');
    console.log('- Verify vite.config.ts has React plugin');
    console.log('- Confirm netlify.toml publishes "dist" directory');
  }
  
  console.log('\n📚 For more help, see: https://docs.netlify.com/configure-builds/troubleshooting-tips/');
}

// Run diagnostics
runDiagnostics().catch(console.error);