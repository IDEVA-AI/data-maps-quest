import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const SeedCupom = () => {
  const [status, setStatus] = useState<string>("Processando...");
  const [code, setCode] = useState<string>("");

  useEffect(() => {
    const run = async () => {
      setCode("A0431C09");
      const { data, error } = await supabase
        .from("cupom")
        .upsert([{ cupom: "A0431C09", active: true }], { onConflict: "cupom" })
        .select();

      if (error) {
        setStatus(`Erro: ${error.message}`);
        return;
      }

      setStatus("Cupom cadastrado/ativado");
    };
    run();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <div>{status}</div>
      <div>{code}</div>
    </div>
  );
};

export default SeedCupom;