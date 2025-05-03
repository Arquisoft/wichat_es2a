
  module.exports = {
    generateValidUser: function (context, events, done) {
      const prefix = "u"; 
      const base = Math.random().toString(36).slice(2, 10); 
      const timestampFragment = Date.now().toString(36).slice(-5); 
      const username = `${prefix}${base}${timestampFragment}`.slice(0, 18);
    
      const password = `Abc123-${base}`;
    
      context.vars.user = {
        id: username,
        username: username,
        password: password,
        confirmPassword: password,
        avatarOptions: {
          avatarColor: "blue",
          avatarStyle: "circle"
        }
      };
    
      return done();
    }    
  };
  