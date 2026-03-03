const fs = require("fs");
function heal(file) {
  if (!fs.existsSync(file)) return;
  let t = fs.readFileSync(file, "utf8");
  t = t.replace(/ rom /g, " from ")
       .replace(/ lex/g, " flex")
       .replace(/ ull/g, " full")
       .replace(/justi y/g, "justify")
       .replace(/ irm/g, "Firm")
       .replace(/ eatures/g, "features")
       .replace(/ ree/g, "Free")
       .replace(/ de ault/g, " default")
       .replace(/ ocus/g, "focus")
       .replace(/ or /g, " for ")
       .replace(/ a ter /g, " after ")
       .replace(/ be ore /g, " before ")
       .replace(/ in o /g, " info ")
       .replace(/ilter/g, "Filter")
       .replace(/ileText/g, "FileText")
       .replace(/Brie case/g, "Briefcase")
       .replace(/Pro essional/g, "Professional")
       .replace(/success ully/g, "successfully")
       .replace(/over low/g, "overflow")
       .replace(/trans orm/g, "transform")
       .replace(/ ont/g, " font")
       .replace(/ re /g, " ref ")
       .replace(/ ui /g, " ui ")
       .replace(/ rames/g, "frames")
       .replace(/ le t/g, " left")
       .replace(/ eed /g, " feed ")
       .replace(/ ind /g, " find ")
       .replace(/ind\(/g, "find(")
       .replace(/ i /g, " if ")
       .replace(/ i\(/g, " if(")
       .replace(/a \(/g, "af(")
       .replace(/o \(/g, "of(")
       .replace(/e \(/g, "ef(")
       .replace(/oti ications/g, "otifications")
       .replace(/Noti ications/g, "Notifications")
       .replace(/Plat orm/g, "Platform");
  fs.writeFileSync(file, t, "utf8");
  console.log("Healed", file);
}
heal("src/sections/AdminDashboard.tsx");
heal("src/sections/auth/AdminLogin.tsx");
heal("src/components/AdminRoute.tsx");
heal("index.html");
