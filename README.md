# Pixel Blade - Guerreros Medievales

Juego 2D pixel art con combate medieval y multijugador online.

## Jugar online
https://davidquirosperez0-create.github.io/pixel-blade/

## Controles
- **WASD** - Mover
- **Click/ESPACIO** - Atacar (hacia el ratón)
- **SHIFT** - Dash (solo combate)
- **E** - Interactuar
- **Q** - Poción
- **TAB** - Inventario
- **1/2/3** - Cambiar arma

## Multijugador Online
Para jugar con amigos necesitas el servidor WebSocket:

```bash
cd server
npm install
npm start
```

Luego abre `http://localhost:3000` en tu navegador.

## Despliegue en Render.com (gratis)
1. Crea cuenta en [render.com](https://render.com)
2. New → Web Service
3. Conecta el repositorio de GitHub
4. Configura:
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && node server.js`
5. Despliega y comparte la URL con tus amigos
