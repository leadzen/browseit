Browse It
=========
VS Code extension for previewing files in your default browser.
## Summary
Yes, just browse it in VS Code! Any file can be opened in your native browser, whether it's in a local folder, in WSL, or in a Docker development container.

* The file contents are sent to the browser as-is without any injected code.  
* Built-in mapping of common file extensions to Content Type MIME.  
* Each workspace folder has a separate built-in Web Server assigned a random access port.  
* In the case of WSL or Docker development containers, port forwarding can be automatically performed without configuration.

## Usage
After installing the extension, select the **"Browse It"** item in any file context menu. The file contents will appear in your local default browser.

## Bug Report
https://github.com/leadzen/browseit/issues