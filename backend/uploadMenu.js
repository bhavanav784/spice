const fs = require("fs");
const path = require("path");

// Read menu JSON file
const menuPath = path.join(__dirname, "menu.json");

if (!fs.existsSync(menuPath)) {
  console.error("menu.json not found!");
  process.exit(1);
}

const menuData = JSON.parse(fs.readFileSync(menuPath, "utf8"));

// "Upload" menu — in this case, we just print it or save it to another file
function uploadMenu() {
  console.log("Menu items:");
  menuData.forEach((item, index) => {
    console.log(`${index + 1}. ${item.name} - ₹${item.price}`);
  });

  // Optional: Save a copy to a local file (in-memory persistence)
  fs.writeFileSync(path.join(__dirname, "menu_storage.json"), JSON.stringify(menuData, null, 2));
  console.log("\nMenu saved to menu_storage.json");
}

uploadMenu();
