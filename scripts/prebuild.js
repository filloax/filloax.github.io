const fs = require("fs");
const path = require("path");

const copyCategories = {
    styles: {
        inputFiles: ["./node_modules/astro-breadcrumbs/src/breadcrumbs.scss"],
        outputFolder: "./src/styles/modules",
    },
};

function copyFiles(inputFiles, outputFolder) {
    if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder, { recursive: true });
    }

    // Copy each file to the output folder
    inputFiles.forEach((file) => {
        const fileName = path.basename(file);
        const destination = path.join(outputFolder, fileName);

        fs.copyFile(file, destination, (err) => {
            if (err) {
                console.error(`Error copying ${file}:`, err);
            } else {
                console.log(`${file} copied to ${destination}`);
            }
        });
    });
}

Object.values(copyCategories).forEach(({inputFiles, outputFolder}) => {
    copyFiles(inputFiles, outputFolder);
});
