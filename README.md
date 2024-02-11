# Revenge

A modification for the Discord Android app. Continuation of [Vendetta](https://github.com/vendetta-mod). Get it? Vendetta is like, revenging..., yeah.
> [!WARNING]
> Revenge is still WIP! Please understand that you might encounter some issues.

## ⬇️ Installing

> [!NOTE]
> While Revenge is platform-agnostic, there is no guarantee it will always work on iOS. I do not have a device to test the changes I've made, so feel free to report iOS-specific issues if you encounter one.

1. Install [Vendetta Manager](https://github.com/vendetta-mod/VendettaManager/releases/latest/download/Manager.apk)
2. Download (don't install!) the latest [Xposed module](https://github.com/revenge-mod/RevengeXposed/releases/latest/download/app-release.apk)
3. Go to Vendetta manager's **Settings > About** and press version number **10 times**
4. Set the custom Xposed module location to:
```
/storage/emulated/0/Download/app-release.apk
```
> [!NOTE]
> This is default location of module if you use *default downloads folder* and *you don't have any `app-release.apk` saved*. If you move module or it has different name - change the path respectively.
5. Head back to main screen and install!
## 💖 Contributing

> [!NOTE]  
> This project now uses [Bun](https://bun.sh) instead of Node.js.  
> It is **recommended** to use Bun over Node.js because Bun is faster and far better for development.  
>
> If you're on Windows, we recommend checking out [WSL](https://github.com/MicrosoftDocs/WSL).

1. Follow the first two steps listed in [**⬇️ Installing**](#%EF%B8%8F-installing) section

2. Clone the repository
    ```
    git clone https://github.com/revenge-mod/Revenge
    ```

3. Install dependencies
    ```
    bun i
    ```

4. Build Revenge
    ```
    bun run build
    ```

5. In the newly created `dist` directory, run a HTTP server. We recommend [http-server](https://www.npmjs.com/package/http-server).

6. Go to **Settings** > **Developer**, enable **Load from custom URL**, and input the IP address and port of the server (e.g. `http://192.168.1.236:4040`) in the new input box labelled **VENDETTA URL**.
   - If the **Developer** setting section doesn't appear, restart the app

8. Restart Discord. Upon reload, you should notice that your device will download Revenge's bundled code from your server, rather than GitHub.

9. Make your changes, rebuild, reload, go wild!
