# Build Steps
The overall process is:

1. Build the app using Create-React-App (CRA)
2. Copy the necessary build files to the `prod-build` folder
3. Amend the `apiUrl` and `listIds` used for testing to the actual ones

## 1. Build the app using CRA
In the `dev` folder, build the app:

```bash
cd dev
npm run build
```

## 2. Copy the necessary build files to the `prod-build` folder
Ensure you're in the data catalogue root folder `data-catalogue` before proceeding.

```bash
cd data-catalogue
```

### 1st Time Only
For the 1st time you're creating the build in the `prod-build` folder, you will need to copy the entire build:

```bash
cp dev/build/* prod-build/
```

Change the JS file extension and name:

```bash
mv prod-build/static/js/main.[js-hash].js prod-build/static/js/main.txt
```

For ease of subsequent builds, also change the CSS file name:

```bash
mv prod-build/static/css/main.[css-hash].css prod-build/static/css/main.css
```

Then, you'll need to make some tweaks in `index.html`:

1. Comment out the manifest and the deferred script to the bundled JS file
2. Copy the following into the bottom of the `<head>` tag:
    - This will dynamically detect the directory (URL) for `index.html` and use that to load the JS code in
    - Remember to change `js-hash` to the actual hash for your file

    ```html
    <script type="text/javascript">
      const fullUrl = window.location.origin + window.location.pathname;
      const txtUrl = `${fullUrl.slice(0, fullUrl.lastIndexOf('/'))}/static/js/` ;

      function loadWords(filename, asynch) {
        // Retrieve text
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
          if (this.readyState == 4 && this.status == 200) {
            var sTag = document.createElement("script");
            sTag.type = "text/javascript";
            sTag.innerHTML = this.responseText;
            var head = document.getElementsByTagName("head")[0];
            head.appendChild(sTag);
          }
        };
        var url = txtUrl + filename + ".txt";
        xhr.open("GET", url, asynch);
        xhr.send();
      }
      
      loadWords('main', true)
    </script>
    ```

3. Amend the reference for the CSS file i.e. `main.css`
4. Amend the path for the icons and CSS files from e.g. `href="/logo.png"` to `href="./logo.png"` to reference files in the same folder as `index.html`

### Subsequent Builds
For subsequent builds, you will only need to remove the old CSS and JS files and copy the new ones over:

```bash
# Copy files over
cp dev/build/static/css/main.[css-hash].css prod-build/static/css/main.css
cp dev/build/static/js/main.[js-hash].js prod-build/static/js/main.txt
```

Whether for the 1st time or subsequent builds, you may want to delete the CSS and JS files' reference to their map files. The references can be found at the last line of the respective CSS/JS files.

## 3. Amend `apiUrl` and `listIds`
Inside the JS .txt file, do a simple find and replace to ensure that the `apiUrl` and `listIds` are the ones actually used in production. Note that searching `apiUrl` or `listId` will not return anything. You must search for the actual value of `apiUrl` (e.g. `http://127.0.0.1:5000/ravenpoint/_api/`) and replace that.