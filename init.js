let request = chrome.webRequest.onBeforeRequest;

chrome.runtime.getPackageDirectoryEntry((root) => {
    let reader = root.createReader();
    reader.readEntries((results) => {
        searchDir(root, results.filter(x => !['init.js', 'manifest.json', 'README.md', 'LICENSE', '.git'].includes(x.name)));
    });
});

function searchDir(parent, directories) {
    for (let directory of directories) {
        parent.getDirectory(directory.name, {create: false}, (dir) => {
            let reader = dir.createReader();
            reader.readEntries((results) => {
                let newDirs = results.filter(x => x.isDirectory);
                let files = results.filter(x => x.isFile);
                if (newDirs.length) searchDir(dir, newDirs);
                for (let file of files) {
                    request.addListener((details) => {
                        return {
                            redirectUrl:chrome.extension.getURL(file.fullPath.replace('/crxfs/', ''))
                        }
                    }, {
                        urls: ['*://*.krunker.io/' + file.fullPath.replace('/crxfs/', '') + '*']
                    }, ['blocking']);
                }
            });
        });
    }
}
//checks all folders