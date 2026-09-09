"""Servidor estático para desarrollo, sin caché.

http.server envía Last-Modified pero no Cache-Control, y el navegador acaba
sirviendo CSS y JS desde memoria aunque el archivo haya cambiado. Eso hace
perder tiempo depurando cambios que en realidad ya estaban aplicados.
Aquí se fuerza no-store para que cada recarga traiga la versión del disco.

Uso:  python .claude/devserver.py [puerto]
"""
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class SinCache(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):
        # Silencia el ruido de cada asset; solo interesan los errores.
        if args and str(args[1]).startswith(("4", "5")):
            super().log_message(fmt, *args)


if __name__ == "__main__":
    puerto = int(sys.argv[1]) if len(sys.argv) > 1 else 4173
    servidor = ThreadingHTTPServer(("127.0.0.1", puerto), partial(SinCache, directory="."))
    print(f"SolarUp en http://localhost:{puerto}  (sin caché)")
    servidor.serve_forever()
