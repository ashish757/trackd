import React, { useEffect, useRef, useState } from "react";
import {X} from "lucide-react";
import {useChangeUsernameMutation} from "../redux/user/userApi.ts";

type Props = {
    isOpen: boolean;
    currentUsername?: string;
    onClose: () => void;
};

export default function ChangeUsernameModal({ isOpen, currentUsername, onClose }: Props) {
    const [value, setValue] = useState(currentUsername || "");
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const modalRef = useRef<HTMLDivElement | null>(null);

    const [changeUsername] = useChangeUsernameMutation();

    useEffect(() => {
        if (isOpen) {
            setValue(currentUsername || "");
            setError(null);
            // focus input when opened
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen, currentUsername]);

    const onSave = async (value: string) => {
        if (isSaving) {
            return;
        }

        try {
            setError(null);
            await changeUsername(value).unwrap();

        } catch (err: unknown) {
            const errorMessage = err && typeof err === 'object' && 'data' in err && err.data && typeof err.data === 'object' && 'message' in err.data
                ? String(err.data.message)
                : 'Failed to change username';
            setError(errorMessage);
            console.error('Failed to cahnge username', err);
        }

    }

    // close on Esc
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        if (isOpen) window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, onClose]);

    // basic validation
    function validate(v: string) {
        const trimmed = v.trim();
        if (trimmed.length < 3) return "Username must be at least 3 characters.";
        if (trimmed.length > 30) return "Username must be 30 characters or less.";
        if (!/^[A-Za-z0-9._-]+$/.test(trimmed)) return "Allowed: letters, numbers, ., _, -";
        return null;
    }

    async function handleSave() {
        const err = validate(value);
        if (err) {
            setError(err);
            inputRef.current?.focus();
            return;
        }

        setIsSaving(true);
        setError(null);
        try {
            await onSave(value.trim());
            onClose();
        } catch (e: unknown) {
            // show friendly message
            if (e instanceof ErrorEvent) {
                setError(e?.message || "Failed to save. Try again.");
            } else
            setError("Unknown Error. Try again.");


        } finally {
            setIsSaving(false);
        }
    }

    // clicking outside closes modal
    function onBackdropClick(e: React.MouseEvent) {
        if (e.target === modalRef.current) onClose();
    }

    if (!isOpen) return null;

    return (
        <div
            ref={modalRef}
            onClick={onBackdropClick}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            aria-modal="true"
            role="dialog"
            aria-labelledby="change-username-title"
        >
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden transform transition-all duration-200">
                {/* Header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-400">

                    <div className="flex-1">
                        <h2 className="font-semibold text-gray-900">
                            Change Username
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="text-gray-400 hover:text-gray-600 rounded-sm p-2"
                    >
                        <X />
                    </button>
                </div>

                {/* Body */}
                <div className="px-10 py-10">
                    <input
                        ref={inputRef}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSave();
                        }}
                        className="w-full rounded-md border px-4 py-3 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        placeholder="Enter New Username"
                        aria-invalid={!!error}
                        aria-describedby={error ? "username-error" : undefined}
                        maxLength={30}
                    />
                    {error ? (
                        <p id="username-error" className="mt-2 text-xs text-red-600">
                            {error}
                        </p>
                    ) : <p></p>
                    }
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-400 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-3 py-2 text-sm rounded-md bg-white border text-gray-700 hover:bg-gray-100 transition"
                        disabled={isSaving}
                    >
                        Discard
                    </button>

                    <button
                        onClick={handleSave}
                        className={`px-4 py-2 text-sm font-medium rounded-md text-white transition ${
                            isSaving ? "bg-indigo-300 cursor-wait" : "bg-indigo-600 hover:bg-indigo-700"
                        }`}
                        disabled={isSaving}
                    >
                        {isSaving ? "Changing..." : "Change"}
                    </button>
                </div>
            </div>
        </div>
    );
}
