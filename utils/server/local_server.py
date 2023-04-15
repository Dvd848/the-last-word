#!/usr/bin/env python3

import os
from http.server import HTTPServer, CGIHTTPRequestHandler

PORT = 8080

os.chdir('../../')
print (f"Serving on http://localhost:{PORT}/")
server_object = HTTPServer(server_address=('', PORT), RequestHandlerClass=CGIHTTPRequestHandler)
server_object.serve_forever()