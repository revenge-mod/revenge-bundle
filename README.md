# Revenge

A modification for the Discord Android app. Continuation of [Vendetta](https://github.com/vendetta-mod). Get it? Vendetta is like, revenging..., yeah.

## ⬇️ Installing

> [!NOTE]
> While Revenge is platform-agnostic, there is no guarantee it will always work on iOS. I do not have a device to test the changes I've made, so feel free to report iOS-specific issues in the Issues tab if you encounter one.

1. Install [Vendetta](https://github.com/vendetta-mod/Vendetta)
2. Go to **Settings** > **General** enable **Developer Settings**
3. Go to **Settings** > **Developer**, enable **Load from custom URL**, and input
   ```
   https://cdn.jsdelivr.net/gh/revenge-mod/builds@main/revenge.js
   ```
   in the new input box labelled **VENDETTA URL**.
   - If the **Developer** settings section does not appear, restart the app
5. Restart the app and check if it says Revenge in the settings

## 💖 Contributing

> [!IMPORTANT]  
> This project now uses [Bun](https://bun.sh) instead of Node.js.  
> It is **recommended** to use Bun over Node.js because Bun is faster and far better for development.  
>
> If you're on Windows, we recommend checking out WSL.

1. Follow the first two steps listed [**⬇️ Installing**](#-installing) section

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
