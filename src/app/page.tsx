import RuleGenerator from "@/components/RuleGenerator";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 sm:p-8 md:p-12 bg-slate-50">
      {/* O RuleGenerator já tem um Card, então não precisamos de um aqui */}
      <RuleGenerator />
    </main>
  );
}