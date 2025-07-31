"use client";

import { loginSchema, TLoginSchema } from "@/schema/LoginSchema";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { signIn } from "next-auth/react";
import { useState } from "react";

import { useRouter } from "nextjs-toploader/app";
import Image from "next/image";

export default function LoginForm() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const form = useForm<TLoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: TLoginSchema) {
    setLoading(true);
    const res = await signIn("credentials", {
      username: values.username,
      password: values.password,
      redirect: false,
    });

    if (res?.error) {
      form.setError("username", {
        type: "manual",
        message: "Username atau Password salah",
      });
      form.setError("password", {
        type: "manual",
        message: "Username atau Password salah",
      });
    } else {
      router.push("/admin/dashboard");
    }

    setLoading(false);
  }

  return (
    <div className="flex h-full w-full flex-col px-7 md:justify-center">
      <div className="flex absolute top-7 left-7 gap-2 items-center h-fit">
        <Image src="/logo-unhas.png" width={40} height={30} alt="logo-unhas" />
        <div>
          <h1 className="font-semibold dark:text-muted-foreground">
            Fakultas Kedokteran Gigi
          </h1>
          <h1 className="text-sm dark:text-muted-foreground">
            Universitas Hasanuddin
          </h1>
        </div>
      </div>

      <Card>
        <CardContent>
          <div className="flex flex-col gap-2 mb-4">
            <CardTitle className="text-2xl">Logbook FKG</CardTitle>
            <h1 className="text-sm ">Tolong Masukkan Username dan Password</h1>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {form.formState.errors.root && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.root.message}
                </p>
              )}

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Tolong Ketik Username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Tolong Ketik Password"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col mt-7 items-center justify-center">
                <Button type="submit" size={"lg"} disabled={loading}>
                  {loading ? (
                    <Loader2 className="animate-spin mr-2" />
                  ) : (
                    <LogIn />
                  )}
                  Login
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="flex text-center absolute bottom-7 left-7 text-sm">
        © {new Date().getFullYear()} PT SkytelIndo
      </div>
    </div>
  );
}
