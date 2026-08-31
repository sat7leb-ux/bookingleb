import json, ctypes, os, base64, sys, traceback

prof = r"C:/Users/ITLEB/AppData/Roaming/Mozilla/Firefox/Profiles/mk10fpdg.default-release"
logins_path = os.path.join(prof, "logins.json")
with open(logins_path) as f:
    data = json.load(f)

nss = ctypes.CDLL(r"C:/Program Files/Mozilla Firefox/nss3.dll")
nss.NSS_Init.argtypes = [ctypes.c_char_p]
nss.NSS_Init.restype = ctypes.c_int
nss.PK11SDR_Decrypt.argtypes = [ctypes.c_void_p]
nss.PK11SDR_Decrypt.restype = ctypes.c_void_p

if nss.NSS_Init(("sql:" + prof).encode()) != 0:
    print("NSS_Init failed", file=sys.stderr); sys.exit(3)

# SECItem layout for this NSS: { int type; unsigned char* data; unsigned int len; }
class SECItem(ctypes.Structure):
    _fields_ = [("type", ctypes.c_int), ("data", ctypes.c_void_p), ("len", ctypes.c_uint)]

def dec(b64):
    raw = base64.b64decode(b64)
    # Build an input SECItem pointing at the decoded bytes.
    in_buf = ctypes.create_string_buffer(raw, len(raw))
    in_si = SECItem(0, ctypes.cast(in_buf, ctypes.c_void_p), len(raw))
    out_ptr = nss.PK11SDR_Decrypt(ctypes.byref(in_si))
    if not out_ptr:
        raise RuntimeError("PK11SDR_Decrypt returned NULL")
    out_si = SECItem.from_address(out_ptr)
    return ctypes.string_at(out_si.data, out_si.len).decode("utf-8", "replace")

for l in data.get("logins", []):
    host = l.get("hostname")
    try:
        u = dec(l["encryptedUsername"])
        p = dec(l["encryptedPassword"])
    except Exception as e:
        print("HOST:", host, "ERR:", repr(e), file=sys.stderr)
        traceback.print_exc()
        continue
    print("HOST:", host)
    print("  USER:", u[:3] + "[REDACTED]  len=%d" % len(u))
    print("  PASS:", p[:3] + "[REDACTED]  len=%d" % len(p))
    sys.stdout.flush()
