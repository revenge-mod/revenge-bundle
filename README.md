# Revenge

A modification for Discord mobile apps. Continuation of [Vendetta](https://github.com/vendetta-mod). Get it? Vendetta is like, revenging..., yeah.

> [!WARNING]
> Revenge is still being worked on! Please understand that you may encounter some issues.

## ⬇️ Installing

### Android

#### Non-root

1. Install [Vendetta Manager](https://github.com/vendetta-mod/VendettaManager/releases/latest/download/Manager.apk)
2. Download *(don't install!)* the latest [Xposed module](https://github.com/revenge-mod/RevengeXposed/releases/latest/download/app-release.apk)
3. Go to Vendetta Manager's **Settings > About** and press version number **10 times**
4. Set **Custom Xposed module location** to:
    ```
    /storage/emulated/0/Download/app-release.apk
    ```
> [!NOTE]
> This is default location of downloaded module if you use the default `Downloads` folder **and** you don't have any file with the same name saved. If these two conditions don't match, you will have to change the path respectively.

5. Head back to main screen and install!

#### Root

1. Install an Xposed implementation (eg. LSPosed)
2. Download and install the latest [Xposed module](https://github.com/revenge-mod/RevengeXposed/releases/latest/download/app-release.apk)
3. Enable the module
4. Force stop Discord

### Alternative method / Other platforms

> [!IMPORTANT]
> While Revenge is platform-agnostic, there is no guarantee it will always work on other platforms. we do not have a device to test the changes I've made, so feel free to report issues if you encounter them.

1. Install [Vendetta](https://github.com/vendetta-mod/Vendetta)
2. Head to **Settings > General** under the **Vendetta** section
3. Toggle on the **Developer Settings** switch
4. Restart the app
5. Head to **Settings > Developer** under the **Vendetta** section
6. Toggle on the **Load Vendetta from custom URL** option
7. Input the following in the text field that appears
    ```
    https://cdn.jsdelivr.net/gh/revenge-mod/builds@main/revenge.js
    ```
8. Restart the app again, and that should be it!

## 💖 Contributing

1. Follow the first two steps listed in [**⬇️ Installing**](#%EF%B8%8F-installing) section

2. Clone the repository
    ```
    git clone https://github.com/revenge-mod/Revenge
    ```

3. Install dependencies
    ```
    npm install
    ```

4. Build Revenge
    ```
    npm run build
    ```

5. In the newly created `dist` directory, run a HTTP server. We recommend [http-server](https://www.npmjs.com/package/http-server).

6. Go to **Settings** > **Developer**, enable **Load from custom URL**, and input the IP address and port of the server (e.g. `http://192.168.1.236:4040`) in the new input box labelled **REVENGE URL**.
   - If the **Developer** setting section doesn't appear, restart the app

7. Restart Discord. Upon reload, you should notice that your device will download Revenge's bundled code from your server, rather than GitHub.

8. Make your changes, rebuild, reload, go wild!
