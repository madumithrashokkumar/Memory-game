import Head from "next/head";
import ChalkboardRamLab from "@/components/ChalkboardRamLab";

export default function Home() {
  return (
    <>
      <Head>
        <title>Milo's Fun Memory Adventure! 🎮</title>
        <meta name="description" content="A playful light-themed kids computer memory learning game" />
        <link rel="icon" href="/favicon.ico" />
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>
      <ChalkboardRamLab />
    </>
  );
}
