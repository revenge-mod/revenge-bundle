## Building
1. Install a Revenge loader with config support (any mentioned in the [Installing](#installing) section).
2. Go to **Settings** > **General** and enable **Developer Settings**.
3. Clone the repository

    ```sh
    git clone https://github.com/revenge-mod/revenge-bundle.git
    ```

4. Install dependencies

    ```
    bun i
    ```

5. Build Revenge's code

    ```
    bun run build
    ```

6. In the newly created `dist` directory, run a HTTP server. I recommend [http-server](https://www.npmjs.com/package/http-server).
7. Go to **Settings** > **Developer** enabled earlier. Enable `Load from custom URL` and input the IP address and port of the server (e.g. `http://192.168.1.236:4040/revenge.js`) in the new input box labeled `Revenge URL`.
8. Restart Discord. Upon reload, you should notice that your device will download Revenge's bundled code from your server, rather than GitHub.
9. Make your changes, rebuild, reload, go wild!

Alternatively, you can directly *serve* the bundled code by running `bun serve`. `revenge.js` will be served on your local address under the port 4040. You will then insert `http://<local ip address>:4040/revenge.js` as a custom URL and reload. Whenever you restart your mobile client, the script will rebuild the bundle as your client fetches it.

If the bundle keeps being cached and not updated, you can instead tap the **Settings** > **Developer** > **Clear JS bundle** option which will prompt you to reload.
