import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Injects the FITT live-cursor forwarder into every served HTML, regardless of
// the generated index.html — this config is canonical (never authored by the AI),
// so cursors work over the running prototype for every project.
const fittCursorForward = {
  name: "fitt-cursor-forward",
  transformIndexHtml() {
    return [
      {
        tag: "script",
        injectTo: "head",
        children:
          "(function(){if(window.parent===window)return;var p=false,lx=0,ly=0;addEventListener('mousemove',function(e){lx=e.clientX;ly=e.clientY;if(p)return;p=true;requestAnimationFrame(function(){p=false;parent.postMessage({__fittCursor:true,x:lx/innerWidth,y:ly/innerHeight},'*');});});addEventListener('mouseleave',function(){parent.postMessage({__fittCursor:true,leave:true},'*');});})();",
      },
    ];
  },
};

export default defineConfig({
  plugins: [react(), fittCursorForward],
  server: { host: true },
});
