import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import {useChangeBioMutation, useChangeNameMutation, useChangeUsernameMutation} from "../redux/user/userApi.ts";
import SuccessAlert from "./SuccessAlert.tsx";
import ErrorAlert from "./ErrorAlert.tsx";

type Props = {
    isOpen: boolean;
    user: {
        name?: string;
        username?: string;
        bio?: string;
    };
    onClose: () => void;
};

export default function EditUserProfileModel({ isOpen, user, onClose }: Props) {
    const [username, setUsername] = useState(user.username || "");
    const [name, setName] = useState(user.name || "");
    const [bio, setBio] = useState(user.bio || "");

    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [nameError, setNameError] = useState<string | null>(null);
    const [bioError, setBioError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [isSavingUsername, setIsSavingUsername] = useState(false);
    const [isSavingName, setIsSavingName] = useState(false);
    const [isSavingBio, setIsSavingBio] = useState(false);


    const modalRef = useRef<HTMLDivElement | null>(null);
    const [changeUsername] = useChangeUsernameMutation();
    const [changeName] = useChangeNameMutation();
    const [changeBio] = useChangeBioMutation()

    useEffect(() => {
        if (isOpen) {
            setUsername(user.username || "");
            setName(user.name || "");
            setBio(user.bio || "");
            setUsernameError(null);
            setNameError(null);
            setBioError(null);
        }
    }, [isOpen, user]);

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        if (isOpen) window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, onClose]);

    const validateUsername = (v: string) => {
        const trimmed = v.trim();
        if (trimmed.length < 3) return "Username must be at least 3 characters.";
        if (trimmed.length > 30) return "Username must be 30 characters or less.";
        if (!/^[A-Za-z0-9._-]+$/.test(trimmed)) return "Allowed: letters, numbers, ., _, -";
        return null;
    };

    const validateName = (v: string) => {
        const trimmed = v.trim();
        if (trimmed.length < 2) return "Name must be at least 2 characters.";
        if (trimmed.length > 50) return "Name must be 50 characters or less.";
        return null;
    };


    const validateBio = (v: string) => {
        if (v.length > 200) return "Bio must be 200 characters or less.";
        return null;
    };

    const handleSaveUsername = async () => {
        const err = validateUsername(username);
        if (err) {
            setUsernameError(err);
            return;
        }

        setIsSavingUsername(true);
        setUsernameError(null);
        try {
            await changeUsername(username.trim()).unwrap();
            setSuccess("Username updated successfully");
        } catch (err: unknown) {
            const errorMessage = err && typeof err === 'object' && 'data' in err && err.data && typeof err.data === 'object' && 'message' in err.data
                ? String(err.data.message)
                : 'Failed to change username';
            setUsernameError(errorMessage);
        } finally {
            setIsSavingUsername(false);
        }
    };

    const handleSaveName = async () => {
        const err = validateName(name);
        if (err) {
            setNameError(err);
            return;
        }

        setIsSavingName(true);
        setNameError(null);
        try {
            await changeName(name.trim()).unwrap();

        } catch (err: unknown) {
            const errorMessage = err && typeof err === 'object' && 'data' in err && err.data && typeof err.data === 'object' && 'message' in err.data
                ? String(err.data.message)
                : 'Failed to change name';
            setNameError(errorMessage);
        } finally {
            setIsSavingName(false);
        }
    };

    const handleSaveBio = async () => {
        const err = validateBio(bio);
        if (err) {
            setBioError(err);
            return;
        }

        setIsSavingBio(true);
        setBioError(null);
        try {
            await changeBio(bio.trim()).unwrap();
        } catch (err: unknown) {
            const errorMessage = err && typeof err === 'object' && 'data' in err && err.data && typeof err.data === 'object' && 'message' in err.data
                ? String(err.data.message)
                : 'Failed to change bio';
            setBioError(errorMessage);
        } finally {
            setIsSavingBio(false);
        }
    };

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
        >
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Edit Profile</h2>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100 transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {success && <SuccessAlert success={success}/>}
                    {/* Username Section */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Username
                        </label>
                        <div className="flex gap-2">
                            <input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder={user.username || "Enter username"}
                                maxLength={30}
                            />
                            <button
                                onClick={handleSaveUsername}
                                className={`px-4 py-2 text-sm font-medium rounded-md text-white transition ${
                                    isSavingUsername ? "bg-indigo-300 cursor-wait" : "bg-indigo-600 hover:bg-indigo-700"
                                }`}
                                disabled={isSavingUsername}
                            >
                                {isSavingUsername ? "Saving..." : "Save"}
                            </button>
                        </div>
                        {usernameError && <ErrorAlert error={usernameError} />}
                    </div>

                    {/* Name Section */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Name
                        </label>
                        <div className="flex gap-2">
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder={user.name || "Enter name"}
                                maxLength={50}
                            />
                            <button
                                onClick={handleSaveName}
                                className={`px-4 py-2 text-sm font-medium rounded-md text-white transition ${
                                    isSavingName ? "bg-indigo-300 cursor-wait" : "bg-indigo-600 hover:bg-indigo-700"
                                }`}
                                disabled={isSavingName}
                            >
                                {isSavingName ? "Saving..." : "Save"}
                            </button>
                        </div>
                        {nameError && <ErrorAlert error={nameError} />}
                    </div>

                    {/* Bio Section */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Bio
                        </label>
                        <div className="space-y-2">
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                placeholder={user.bio || "Tell us about yourself"}
                                rows={4}
                                maxLength={200}
                            />
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                    {bio.length}/200 characters
                                </span>
                                <button
                                    onClick={handleSaveBio}
                                    className={`px-4 py-2 text-sm font-medium rounded-md text-white transition ${
                                        isSavingBio ? "bg-indigo-300 cursor-wait" : "bg-indigo-600 hover:bg-indigo-700"
                                    }`}
                                    disabled={isSavingBio}
                                >
                                    {isSavingBio ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </div>
                        {bioError && <ErrorAlert error={bioError} />}
                    </div>
                </div>
            </div>
        </div>
    );
}
