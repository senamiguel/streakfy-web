"use client";
import styles from './page.module.css';
import { useState, memo } from "react";
import Iridescence from "@/Backgrounds/Iridescence/Iridescence";
import { useRouter } from "next/navigation";

export default function Home() {
  return(
    <>
    This is only a placeholder.
    <a href="/login">Login</a>
    </>
  );
}