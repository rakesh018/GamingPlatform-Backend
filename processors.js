const tokens = [
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NmIyMzliZTVjNDkxMTNmN2MzMjg5NzQiLCJ1aWQiOiJXTTc0ODQxMTAiLCJpYXQiOjE3MjI5NTkzNDksImV4cCI6MTcyMzU2NDE0OX0.mH5f4_PbOC28QZyIRJP5BHrUH8g7CXMGImFheq00Ruo",
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NmIyM2E0ZTVjNDkxMTNmN2MzMjg5YWEiLCJ1aWQiOiJXTTg4MTc4ODciLCJpYXQiOjE3MjI5NTkzNzAsImV4cCI6MTcyMzU2NDE3MH0.3vXHX-iCG7wweo05UvJnfSfhBeow-Xgvfy1uF2mgdO8",
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NmIyM2I0MzQ0NDYzYzk4OWE3ZDNhYTEiLCJ1aWQiOiJXTTkwNzEyNzkiLCJpYXQiOjE3MjI5NTkzODUsImV4cCI6MTcyMzU2NDE4NX0.Py2roj1uFR63gktDUqo4QnwdIDBQX6iwhAzeL7g2_ik",
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NmIxMGVhN2UzMDM5NTVkNjQzZmUyMWIiLCJ1aWQiOiJXTTU4Mzg5NjYiLCJpYXQiOjE3MjI5NTk0MDQsImV4cCI6MTcyMzU2NDIwNH0.kPeZa9tiMTMfjZ-WKrmQdaAnonXeM_2xs2LnmLwA6Uk",
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NmIyM2JiMjQ0NDYzYzk4OWE3ZDNhYzAiLCJ1aWQiOiJXTTgxNDQ0OTEiLCJpYXQiOjE3MjI5NTk0MjEsImV4cCI6MTcyMzU2NDIyMX0.G7UBL_F4ZpO52MvLs3E9O1MLsZexNc69xgJ2QsinJf4",
  ];
  
  module.exports = {
    setRandomToken: (context, events, done) => {
      const randomIndex = Math.floor(Math.random() * tokens.length);
      context.vars.token = tokens[randomIndex];
      return done();
    },
  };
  