# Pixel Blade - Guerreros Medievales

Juego 2D pixel art con combate medieval y multijugador online.

## Jugar online (URL FIJA, siempre la misma)
Despliega el juego una sola vez y usa siempre la misma URL. Todo el mundo (tu y tus amigos)
accede por esa misma dirección y dentro del juego elige la sala.

URL de despliegue recomendada: **https://pixel-blade-server.onrender.com** (la que crees en Render)

## Controles
- **WASD** - Mover
- **Click/ESPACIO** - Atacar (hacia el ratón)
- **SHIFT** - Dash (solo combate)
- **E** - Interactuar
- **Q** - Poción
- **TAB** - Inventario
- **1/2/3** - Cambiar arma

## Cómo jugar con amigos desde sus casas (URL que no cambia)

Para que tus amigos se conecten desde fuera necesitas el servidor publicado en Internet
con una dirección permanente. La forma más fácil y gratuita es **Render.com**:

1. Sube este proyecto a un repositorio de GitHub (con el servidor incluido).
2. Crea cuenta en [render.com](https://render.com) → New → Web Service.
3. Conecta tu repositorio de GitHub.
4. Configura:
   - **Build Command:** `npm install`
   - **Start Command:** `node server/server.js`
5. Render te da una URL fija (ej. `https://pixel-blade-server.onrender.com`).
   **Esa URL no cambia nunca** → es la única que compartes con tus amigos.
6. Abre esa URL → pulsa **ONLINE** → crea una sala o únete a una existente de la lista.

### Probar en local (opcional)
```bash
cd server
npm install
npm start
```
Abre `http://localhost:3000` en tu navegador.

## Nota técnica: URL del servidor
En `js/game.js` la constante `MP_SERVER_URL` controla a dónde conecta el WebSocket:
- Déjala vacía `''` → usa el mismo dominio donde está publicado el juego (recomendado con Render).
- Si el juego está en un dominio (ej. GitHub Pages) y el servidor en otro, pon ahí la URL
  del servidor, ej: `const MP_SERVER_URL='wss://pixel-blade-server.onrender.com';`

> Cualquier URL con `localhost` o de túneles temporales (loca.lt, ngrok, etc.) **cambia cada vez**.
> Usa Render u otro hosting permanente para tener siempre la misma dirección.
