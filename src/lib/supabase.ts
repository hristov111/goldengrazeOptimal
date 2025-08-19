import { createClient } from '@supabase/supabase-js'

// Create mock client factory function
const makeMockClient = () => ({
  auth: {
    signUp: async () => ({ data: null, error: { message: 'Please connect to Supabase first' } }),
    signInWithPassword: async () => ({ data: null, error: { message: 'Please connect to Supabase first' } }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    updateUser: async () => ({ data: null, error: { message: 'Please connect to Supabase first' } }),
    getSession: async () => ({ data: { session: null }, error: null })
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        maybeSingle: async () => ({ data: null, error: { message: 'Please connect to Supabase first' } }),
        single: async () => ({ data: null, error: { message: 'Please connect to Supabase first' } }),
        order: () => ({
          limit: () => ({
            maybeSingle: async () => ({ data: null, error: { message: 'Please connect to Supabase first' } })
          })
        })
      }),
      order: () => ({ data: [], error: null }),
      range: () => ({ data: [], error: null })
    }),
    insert: () => ({
      select: () => ({
        single: async () => ({ data: null, error: { message: 'Please connect to Supabase first' } })
      })
    }),
    update: () => ({
      eq: () => ({
        select: () => ({
          single: async () => ({ data: null, error: { message: 'Please connect to Supabase first' } })
        })
      })
    }),
    delete: () => ({
      eq: async () => ({ error: { message: 'Please connect to Supabase first' } })
    }),
    upsert: () => ({
      select: () => ({
        single: async () => ({ data: null, error: { message: 'Please connect to Supabase first' } })
      })
    })
  }),
  storage: {
    from: () => ({
      createSignedUrl: async () => ({ data: null, error: { message: 'Please connect to Supabase first' } }),
      getPublicUrl: () => ({ data: { publicUrl: '' } })
    })
  },
  rpc: () => ({ data: null, error: { message: 'Please connect to Supabase first' } })
});

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase: any;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_url' || supabaseAnonKey === 'your_supabase_anon_key') {
  console.warn('Missing Supabase environment variables. Please connect to Supabase to enable full functionality.')
  supabase = makeMockClient();
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      global: {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    });
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    // Fall back to mock client if initialization fails  
    supabase = makeMockClient();
  }
}

export { supabase };

// Auth helper functions
export const auth = {
  signUp: async (email: string, password: string, fullName: string) => {
    try {
      const response = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });
      return response;
    } catch (error: any) {
      return { data: null, error: { message: error.message || 'Network error during sign up' } };
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      const response = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return response;
    } catch (error: any) {
      return { data: null, error: { message: error.message || 'Network error during sign in' } };
    }
  },

  signOut: async () => {
    try {
      return await supabase.auth.signOut();
    } catch (error: any) {
      return { error: { message: error.message || 'Network error during sign out' } };
    }
  },

  getCurrentUser: async () => {
    try {
      return await supabase.auth.getUser();
    } catch (error: any) {
      return { data: { user: null }, error: { message: error.message || 'Network error getting user' } };
    }
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    try {
      return supabase.auth.onAuthStateChange(callback);
    } catch (error: any) {
      console.warn('Auth state change listener failed:', error);
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  },

  updateUser: async (updates: { email?: string; password?: string }) => {
    try {
      return await supabase.auth.updateUser(updates);
    } catch (error: any) {
      return { data: null, error: { message: error.message || 'Network error updating user' } };
    }
  }
}

// Database helper functions
export const database = {
  supabase, // Add direct supabase access for admin operations
  // Profile functions (using profiles table, not users)
  getUserProfile: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      return { data, error };
    } catch (error: any) {
      return { data: null, error: { message: error.message || 'Network error fetching profile' } };
    }
  },

  updateUserProfile: async (userId: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      
      return { data, error };
    } catch (error: any) {
      return { data: null, error: { message: error.message || 'Network error updating profile' } };
    }
  },

  // Product functions
  getProducts: async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      return { data, error };
    } catch (error: any) {
      return { data: [], error: { message: error.message || 'Network error fetching products' } };
    }
  },

  getProduct: async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
      
      return { data, error };
    } catch (error: any) {
      // Handle network connectivity issues
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        return { 
          data: null, 
          error: { 
            message: 'Unable to connect to database. Please check your internet connection and try again.',
            code: 'NETWORK_ERROR'
          } 
        };
      }
      return { data: null, error: { message: error.message || 'Network error fetching product' } };
    }
  },

  // Orders functions
  getOrders: async (userId: string, offset = 0, limit = 10, filters?: { status?: string; search?: string }) => {
    let query = supabase
      .from('orders')
      .select('id, order_number, status, total_cents, currency, placed_at, tracking_number, estimated_delivery')
      .eq('user_id', userId)
      .order('placed_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.search) {
      query = query.ilike('order_number', `%${filters.search}%`);
    }

    query = query.range(offset, offset + limit - 1);

    return await query;
  },

  getOrderByNumber: async (orderNumber: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .single();
    
    return { data, error };
  },

  getOrderItems: async (orderId: string) => {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);
    
    return { data, error };
  },

  getOrderEvents: async (orderId: string) => {
    const { data, error } = await supabase
      .from('order_events')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });
    
    return { data, error };
  },

  updateOrderStatus: async (orderId: string, status: string) => {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();
    
    return { data, error };
  },

  // Support functions
  getSupportTickets: async (userId: string, filters?: { status?: string; category?: string }) => {
    let query = supabase
      .from('support_tickets')
      .select('id, subject, status, category, order_number, priority, created_at, last_message_at')
      .eq('user_id', userId)
      .order('last_message_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    return await query;
  },

  getSupportTicket: async (ticketId: string) => {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', ticketId)
      .single();
    
    return { data, error };
  },

  createSupportTicket: async (ticketData: {
    user_id?: string;
    email: string;
    subject: string;
    category: string;
    order_number?: string;
    priority?: string;
  }) => {
    const { data, error } = await supabase
      .from('support_tickets')
      .insert(ticketData)
      .select()
      .single();
    
    return { data, error };
  },

  getSupportMessages: async (ticketId: string) => {
    const { data, error } = await supabase
      .from('support_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });
    
    return { data, error };
  },

  createSupportMessage: async (messageData: {
    ticket_id: string;
    sender: string;
    user_id?: string;
    body: string;
    attachments?: any;
  }) => {
    const { data, error } = await supabase
      .from('support_messages')
      .insert(messageData)
      .select()
      .single();
    
    return { data, error };
  },

  updateSupportTicketStatus: async (ticketId: string, status: string) => {
    const { data, error } = await supabase
      .from('support_tickets')
      .update({ status })
      .eq('id', ticketId)
      .select()
      .single();
    
    return { data, error };
  },

  // Cart functions
  getCartItems: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id, quantity, added_at,
          product:products!inner (
            id, name, description, price, category, scent, size, stock_quantity, image_url, is_active
          )
        `)
        .eq('user_id', userId)
        .order('added_at', { ascending: false });
      
      return { data, error };
    } catch (error: any) {
      return { data: [], error: { message: error.message || 'Network error fetching cart items' } };
    }
  },

  addToCart: async (userId: string, productId: string, quantity: number = 1) => {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .upsert(
          { user_id: userId, product_id: productId, quantity },
          { onConflict: 'user_id,product_id' }
        )
        .select()
        .single();
      
      return { data, error };
    } catch (error: any) {
      return { data: null, error: { message: error.message || 'Network error adding to cart' } };
    }
  },

  updateCartItemQuantity: async (itemId: string, quantity: number) => {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId)
        .select()
        .single();
      
      return { data, error };
    } catch (error: any) {
      return { data: null, error: { message: error.message || 'Network error updating cart item' } };
    }
  },

  removeFromCart: async (itemId: string) => {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);
      
      return { data, error };
    } catch (error: any) {
      return { data: null, error: { message: error.message || 'Network error removing from cart' } };
    }
  },

  clearCart: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId);
      
      return { data, error };
    } catch (error: any) {
      return { data: null, error: { message: error.message || 'Network error clearing cart' } };
    }
  },

  // Wishlist functions
  getWishlistItems: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select(`
          id, added_at,
          product:products!inner (
            id, name, description, price, category, scent, size, stock_quantity, image_url, is_active
          )
        `)
        .eq('user_id', userId)
        .order('added_at', { ascending: false });
      
      return { data, error };
    } catch (error: any) {
      return { data: [], error: { message: error.message || 'Network error fetching wishlist items' } };
    }
  },

  addToWishlist: async (userId: string, productId: string) => {
    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .upsert(
          { user_id: userId, product_id: productId },
          { onConflict: 'user_id,product_id' }
        )
        .select()
        .single();
      
      return { data, error };
    } catch (error: any) {
      return { data: null, error: { message: error.message || 'Network error adding to wishlist' } };
    }
  },

  removeFromWishlist: async (itemId: string) => {
    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('id', itemId);
      
      return { data, error };
    } catch (error: any) {
      return { data: null, error: { message: error.message || 'Network error removing from wishlist' } };
    }
  },

  isInWishlist: async (userId: string, productId: string) => {
    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .maybeSingle();
      
      return { data: !!data, error };
    } catch (error: any) {
      return { data: false, error: { message: error.message || 'Network error checking wishlist' } };
    }
  },

  moveToCartFromWishlist: async (userId: string, productId: string, wishlistItemId: string) => {
    try {
      // Start a transaction-like operation
      const { error: removeError } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('id', wishlistItemId);
      
      if (removeError) return { data: null, error: removeError };
      
      const { data, error } = await supabase
        .from('cart_items')
        .upsert(
          { user_id: userId, product_id: productId, quantity: 1 },
          { onConflict: 'user_id,product_id' }
        )
        .select()
        .single();
      
      return { data, error };
    } catch (error: any) {
      return { data: null, error: { message: error.message || 'Network error moving item to cart' } };
    }
  }
}