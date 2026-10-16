import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

export function PasswordInput(props: ComponentProps<typeof Input>) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={show ? "text" : "password"} dir="ltr" className="pe-10" />
      <button type="button" onClick={() => setShow(!show)} className="absolute inset-y-0 end-0 grid w-10 place-items-center text-muted-foreground hover:text-foreground" aria-label={show ? "Hide password" : "Show password"}>
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}
