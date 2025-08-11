(function(){
  function getCookie(name) {
    return document.cookie.split(";").map(s => s.trim()).find(s => s.startsWith(name+"="))?.split("=")[1];
  }
  
  function basePayload(extra = {}) {
    return {
      url: location.href,
      ttclid: new URLSearchParams(location.search).get("ttclid") || undefined,
      ttp: getCookie("_ttp") || undefined,
      ...extra
    };
  }
  
  window.TT_S2S = {
    completeRegistration: (p={}) => fetch("/api/tiktok/complete_registration", {
      method: "POST", 
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(basePayload(p))
    }),
    
    placeOrder: (p={}) => fetch("/api/tiktok/place_order", {
      method: "POST", 
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(basePayload(p))
    }),
    
    addToCart: (p={}) => fetch("/api/tiktok/add_to_cart", {
      method: "POST", 
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(basePayload(p))
    })
  };
})();