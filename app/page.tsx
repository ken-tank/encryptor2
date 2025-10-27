'use client'

import React, { useEffect, useRef, useState } from "react";
import { decryptAESGCM, encryptAESGCM, generateSHA256Key } from "./api/aes";

// ---------- UI Components ----------
export function Card({ children, className = "bg-primary flex flex-col gap-2 p-4 rounded-lg" }: {
  children?: React.ReactNode,
  className?: string,
}) {
  return <div className={className}>{children}</div>;
}

export function Group({ children, title, className = "flex flex-col gap-2 p-4 pt-8" }: {
  children?: React.ReactNode,
  className?: string,
  title?: string,
}) {
  return (
    <div className="relative border border-secondary mt-4 rounded-lg">
      <span className="absolute top-0 left-10 -translate-y-[60%] px-2 bg-background">
        {title}
      </span>
      <div className={className}>{children}</div>
    </div>
  );
}

export function TextField({ label, name, id, children }: {
  label?: string,
  name?: string,
  id?: string,
  children?: React.ReactNode,
}) {
  return (
    <Card className="relative bg-primary flex flex-row not-lg:flex-col gap-4 p-4 rounded-lg">
      <span className="w-32 flex flex-row justify-between shrink-0 py-3 not-lg:py-1">
        <span>{label}</span>
        <span>:</span>
      </span>
      <input
        type="text"
        name={name}
        id={id}
        className="bg-secondary rounded-lg grow p-3"
      />
      <div className={"flex flex-row-reverse items-center" + (children ? "" : " hidden")}>
        {children}
      </div>
    </Card>
  );
}

export function TextAreaField({ label, name, id }: {
  label?: string,
  name?: string,
  id?: string,
}) {
  return (
    <Card className="relative bg-primary flex flex-row not-lg:flex-col gap-4 p-4 rounded-lg">
      <span className="w-32 flex flex-row justify-between shrink-0 py-3 not-lg:py-1">
        <span>{label}</span>
        <span>:</span>
      </span>
      <textarea
        name={name}
        id={id}
        className="bg-secondary rounded-lg grow p-3 h-52"
      ></textarea>
    </Card>
  );
}

export function Button({ children, onClick }: {
  children?: React.ReactNode,
  onClick?: React.MouseEventHandler<HTMLButtonElement>,
}) {
  return (
    <button
      className="bg-blue-600 hover:bg-blue-500 p-3 px-5 rounded-lg duration-200 active:scale-[0.98]"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// ---------- Loading Overlay ----------
const LoadingOverlay = React.memo(({ visible }: { visible: boolean }) => (
  <div
    className={`fixed top-0 left-0 w-full h-full bg-black/10 duration-300 transition-opacity ${
      visible ? "opacity-100 visible" : "opacity-0 invisible"
    }`}
  />
));

// ---------- Notification ----------
const Notif = React.memo(({ msg, visible }: { msg?: string; visible: boolean }) => (
  <div
    id="notif"
    className={`fixed bottom-5 left-1/2 -translate-x-1/2 ${
      visible ? "translate-y-0 opacity-100" : "translate-y-32 opacity-0"
    } max-w-64 bg-blue-500 p-5 py-3 rounded-lg flex flex-col justify-center items-center 
      duration-300 will-change-transform shadow-lg shadow-black/20`}
  >
    {msg}
  </div>
));

// ---------- Main Component ----------
export default function Home() {
  const keyRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const notifActive = useRef(false);

  const [result, setResult] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);
  const [notifMsg, setNotifMsg] = useState<string>("");

  async function Generate() {
    setLoading(true);
    if (keyRef.current) {
      keyRef.current.value = await generateSHA256Key();
    }
    setLoading(false);
  }

  async function Encrypt() {
    if (!inputRef.current || !keyRef.current) return;
    setLoading(true);
    try {
      const task = await encryptAESGCM(inputRef.current.value, keyRef.current.value);
      setResult(task);
    } catch (reason: unknown) {
      const msg =
        reason instanceof DOMException
          ? `CryptoError: ${reason.message}`
          : reason instanceof Error
          ? reason.message
          : typeof reason === "string"
          ? reason
          : "Unknown error";
      setResult(msg);
    } finally {
      setLoading(false);
    }
  }

  async function Decrypt() {
    if (!inputRef.current || !keyRef.current) return;
    setLoading(true);
    try {
      const task = await decryptAESGCM(inputRef.current.value, keyRef.current.value);
      setResult(task);
    } catch (reason: unknown) {
      const msg =
        reason instanceof DOMException
          ? `CryptoError: ${reason.message}`
          : reason instanceof Error
          ? reason.message
          : typeof reason === "string"
          ? reason
          : "Unknown error";
      setResult(msg);
    } finally {
      setLoading(false);
    }
  }

  function ShowNotif(msg: string) {
    if (notifActive.current) return;
    notifActive.current = true;
    setNotifMsg(msg);
    setNotifVisible(true);
    setTimeout(() => {
      setNotifVisible(false);
      notifActive.current = false;
    }, 3000);
  }

  function CopyResult() {
    if (!result) {
      ShowNotif("No value to copy");
      return;
    }
    ShowNotif("Copied to clipboard!");
    navigator.clipboard.writeText(result);
  }

  return (
    <>
      <Group title="Input">
        <Card>
          <div className="flex flex-row not-lg:flex-col gap-2">
            <span className="lg:w-32 flex flex-row lg:justify-between not-lg:gap-2 shrink-0 py-3 not-lg:py-1">
              <span>Secret Key</span>
              <span>:</span>
            </span>
            <input
              ref={keyRef}
              type="text"
              className="bg-secondary rounded-lg grow p-3"
            />
            <div className="flex flex-row-reverse">
              <Button onClick={Generate}>Generate</Button>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex flex-row not-lg:flex-col gap-2">
            <span className="lg:w-32 flex flex-row lg:justify-between not-lg:gap-2 shrink-0 py-3 not-lg:py-1">
              <span>Input</span>
              <span>:</span>
            </span>
            <textarea
              ref={inputRef}
              className="bg-secondary rounded-lg grow p-3 h-52"
            ></textarea>
          </div>
        </Card>
        <Card>
          <div className="flex flex-row-reverse gap-3">
            <Button onClick={Encrypt}>Encrypt</Button>
            <Button onClick={Decrypt}>Decrypt</Button>
            <Button onClick={() => {
              inputRef.current!.value = "";
            }}>Clear</Button>
          </div>
        </Card>
      </Group>

      <Group title="Result">
        <Card className="bg-primary flex flex-col gap-4 p-4 rounded-lg">
          <div className="flex flex-row justify-between items-center">
            <span>Output</span>
            <Button onClick={CopyResult}>Copy</Button>
          </div>
          <div className="bg-secondary p-3 rounded-lg">
            <p className="min-h-32 max-h-64 overflow-y-auto break-all">{result}</p>
          </div>
        </Card>
      </Group>

      <LoadingOverlay visible={loading} />
      <Notif msg={notifMsg} visible={notifVisible} />
    </>
  );
}
