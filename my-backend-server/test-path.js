const fs = require('fs');
const path = require('path');

const targetPath = 'C:/Users/Valdemir Goncalves/Desktop/PromptVaultAI/agents-name-firebase-adminsdk-11gpq-0d1fcdaa0c.json';

console.log("Checking path:", targetPath);

if (fs.existsSync(targetPath)) {
    console.log("✅ SUCCESS: File found!");
} else {
    console.log("❌ ERROR: File NOT found at that location.");
    console.log("Here is what I see in the PromptVaultAI folder:");
    try {
        const files = fs.readdirSync('C:/Users/Valdemir Goncalves/Desktop/PromptVaultAI/');
        console.log(files);
    } catch (e) {
        console.log("Could not even read the folder. Check permissions.");
    }
}