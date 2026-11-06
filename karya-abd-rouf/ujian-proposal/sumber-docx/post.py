import zipfile, re, shutil, sys
p = sys.argv[1]; tmp = p + ".tmp"
with zipfile.ZipFile(p) as zi, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zo:
    for it in zi.infolist():
        if it.filename.endswith("/"): continue
        data = zi.read(it.filename)
        if it.filename == "word/document.xml":
            s = data.decode("utf-8")
            s = re.sub(r"(<m:oMath>.*?</m:oMath>)", r"<m:oMathPara>\1</m:oMathPara>", s, flags=re.S)
            data = s.encode("utf-8")
        zo.writestr(it.filename, data)
shutil.move(tmp, p); print("post ok")
