import ctypes, os, sys
prof = r"C:/Users/ITLEB/AppData/Roaming/Mozilla/Firefox/Profiles/mk10fpdg.default-release"
nss = ctypes.CDLL(r"C:/Program Files/Mozilla Firefox/nss3.dll")
nss.NSS_Init.argtypes = [ctypes.c_char_p]
nss.NSS_Init.restype = ctypes.c_int
r = nss.NSS_Init(("sql:" + prof).encode())
print("NSS_Init ->", r, file=sys.stderr)
sys.stderr.flush()
