'use client'

import React, { useEffect, useState } from "react";
import { decryptAESGCM, encryptAESGCM, generateSHA256Key } from "./api/aes";

export function Card({ children, className = "bg-primary flex flex-col gap-2 p-4 rounded-lg" }: Readonly<{
  children?: React.ReactNode,
  className?: string,
}>) {
  return <div className={className}>
    {children}
  </div>
}

export function Group({ children, title, className = "flex flex-col gap-2 p-4 pt-8" }: Readonly<{
  children?: React.ReactNode,
  className?: string,
  title?: string,
}>) {
  return <div className="relative border border-secondary mt-4 rounded-lg">
    <span className="absolute top-0 left-10 -translate-y-[60%] px-2 bg-background">
      {title}
    </span>
    <div className={className}>
      {children}
    </div>
  </div>
}

export function TextField({ label, name, children = null, id }: {
  label?: string,
  name?: string,
  children?: React.ReactNode,
  id?: string
}) {
  return <Card className="relative bg-primary flex flex-row gap-4 p-4 rounded-lg">
    <span className="w-32 flex flex-row justify-between shrink-0 py-3">
      <span>{label}</span>
      <span>:</span>
    </span>
    <input type="text" name={name} id={id} className="bg-secondary rounded-lg grow p-3" />
    <div className={"flex flex-row-reverse items-center" + (children === null ? " hidden" : "")}>
      {children}
    </div>
  </Card>
}

export function TextAreaField({ label, name, id }: {
  label?: string,
  name?: string,
  id?: string
}) {
  return <Card className="relative bg-primary flex flex-row gap-4 p-4 rounded-lg">
    <span className="w-32 flex flex-row justify-between shrink-0 py-3">
      <span>{label}</span>
      <span>:</span>
    </span>
    <textarea name={name} id={id} className="bg-secondary rounded-lg grow p-3 h-52"></textarea>
  </Card>
}

export function Button({ children, onClick }: {
  children?: React.ReactNode,
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}) {
  return <button className="bg-blue-600 hover:bg-blue-500 p-3 px-5 rounded-lg duration-200 shadow-lg shadow-black/20" onClick={onClick}>
    {children}
  </button>
}

export default function Home() {
  const [result, setResult] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState<HTMLElement | any>()
  const [input, setInput] = useState<HTMLElement | any>()
  const [notif, setNotif] = useState<string>("translate-y-32")
  const [notifMsg, setNotifMsg] = useState<string>();

  var isNotifShow = false;

  useEffect(() => {
    setKey(document.getElementById("key"));
    setInput(document.getElementById("input"));
    setLoading(false);
  }, [])

  async function Generate() {
    setLoading(true);
    (key as any).value = await generateSHA256Key();
    setLoading(false);
  }

  async function Encrypt() {
    setLoading(true);
    try {
      var i = input.value as string;
      var k = key.value as string;
      var task = await encryptAESGCM(i, k);
      setResult(task);
    }
    catch (reason: unknown) {
      let msg = "Unknown error";

      if (reason instanceof DOMException) {
        msg = `CryptoError: ${reason.message}`;
      } else if (reason instanceof Error) {
        msg = reason.message;
      } else if (typeof reason === "string") {
        msg = reason;
      }

      setResult(msg);
    }
    finally {
      setLoading(false)
    }
  }

  async function Decrypt() {
    setLoading(true);
    try {
      var i = input.value as string;
      var k = key.value as string;
      var task = await decryptAESGCM(i, k);
      setResult(task);
    }
    catch (reason: unknown) {
      let msg = "Unknown error";

      if (reason instanceof DOMException) {
        msg = `CryptoError: ${reason.message}`;
      } else if (reason instanceof Error) {
        msg = reason.message;
      } else if (typeof reason === "string") {
        msg = reason;
      }

      setResult(msg);
    }
    finally {
      setLoading(false)
    }
  }

  function ShowNotif(msg: string) {
    if (isNotifShow) return;
    isNotifShow = true;
    setNotif(isNotifShow ? "translate-y-0" : "translate-y-32");
    setNotifMsg(msg);

    setTimeout(() => {
      setNotif("translate-y-32");
      isNotifShow = false;
    }, 3000)
  }

  function CopyResult() {
    var r = "";
    if (result === undefined) {
      console.log("No Value to Copy");
      ShowNotif("No Value to Copy");
    }
    else {
      r = result;
      navigator.clipboard.writeText(r)
      ShowNotif("Text Copyed to clipboard!");
    }
  }


  return (
    <>
      <Group title="Input">
        <TextField label="Secret Key" id="key">
          <Button onClick={Generate}>Generate</Button>
        </TextField>
        <TextAreaField label="Input" id="input" />
        <Card>
          <div className="flex flex-row-reverse gap-3">
            <Button onClick={Encrypt}>Encrypt</Button>
            <Button onClick={Decrypt}>Decrypt</Button>
          </div>
        </Card>
      </Group>
      <Group title="Result">
        <Card className="bg-primary flex flex-col gap-4 p-4 rounded-lg">
          <div className="flex flex-row justify-between items-center">
            <span>Output</span>
            <div className="flex flex-row-reverse items-center">
              <Button onClick={CopyResult}>Copy</Button>
            </div>
          </div>
          <div className="bg-secondary p-3 rounded-lg">
            <p className="min-h-32 max-h-64 overflow-y-auto break-all">{result}</p>
          </div>
        </Card>
      </Group>
      <div className={(loading ? "visible" : "hidden") + " fixed top-0 left-0 w-full h-full bg-black/10 duration-300"}>

      </div>
      <div id="notif" className={`fixed bottom-5 left-[50%] ${notif} max-w-64 bg-blue-500 p-5 py-3 rounded-lg flex flex-col justify-center items-cente duration-300`}>
        {notifMsg}
      </div>
    </>
  );
}
