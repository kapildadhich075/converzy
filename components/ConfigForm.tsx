"use client";

import React, { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CogIcon } from "lucide-react";
import { useConfig } from "./stores/useConfig";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Switch } from "./ui/switch";

const FormSchema = z.object({
  isGemini: z.boolean().default(false),
  isCustomApiKey: z.boolean().default(false),
  isServiceApiKey: z.boolean().default(false),
  openAPIKey: z.string().optional(),
});

function ConfigForm() {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const { isGemini, setIsGemini, openAIKey, setOpenAIKey } = useConfig();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      isGemini: isGemini,
      isCustomApiKey: !!openAIKey,
      isServiceApiKey: !isGemini && !openAIKey,
      openAPIKey: openAIKey ? "**********" : "",
    },
  });

  useEffect(() => {
    const currentValues = form.getValues();
    if (
      currentValues.isGemini !== isGemini ||
      currentValues.openAPIKey !== openAIKey
    ) {
      form.reset({
        isGemini: isGemini,
        isCustomApiKey: !!openAIKey,
        isServiceApiKey: !isGemini && !openAIKey,
        openAPIKey: openAIKey ? "**********" : "",
      });
    }
  }, [isGemini, openAIKey]);

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    if (data.isGemini) {
      setIsGemini(true);
      setOpenAIKey("");
      toast({
        title: "Success",
        description: <p>You have selected using Gemini model.</p>,
      });
    } else if (data.isCustomApiKey && data.openAPIKey) {
      setIsGemini(false);
      setOpenAIKey(data.openAPIKey);
      toast({
        title: "Success",
        description: <p>You have selected using your own OpenAI key.</p>,
      });
    } else {
      setIsGemini(false);
      setOpenAIKey("");
      toast({
        title: "Success",
        description: <p>You have selected using our service key.</p>,
      });
    }
    setSheetOpen(false);
  };
  const handleGeminiChange = (checked: boolean) => {
    form.setValue("isGemini", checked, { shouldValidate: true });
    if (checked) {
      form.setValue("isCustomApiKey", false, { shouldValidate: true });
      form.setValue("isServiceApiKey", false, { shouldValidate: true });
    }
  };

  const handleServiceKeyChange = (checked: boolean) => {
    form.setValue("isServiceApiKey", checked, { shouldValidate: true });
    if (checked) {
      form.setValue("isCustomApiKey", false, { shouldValidate: true });
    }
  };

  const handleCustomKeyChange = (checked: boolean) => {
    form.setValue("isCustomApiKey", checked, { shouldValidate: true });
    if (checked) {
      form.setValue("isServiceApiKey", false, { shouldValidate: true });
    }
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger>
        <div
          className={cn(
            buttonVariants({ size: "icon" }),
            `fixed left-0 top-1/3 lg:top-1/4 rounded-none rounded-r-lg bg-blue-500 p-2 text-white`
          )}
        >
          <CogIcon className="size-10 animate-spin-slow" />
        </div>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>PaperPal Powered by OpenAI</SheetTitle>
          <SheetDescription>
            PaperPal leverages the capabilities of OpenAI to bring you
            cutting-edge features.
          </SheetDescription>
        </SheetHeader>
        <div className="flex grow flex-col">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full space-y-6"
            >
              <div className="mt-5 border-t pt-5">
                <h3 className="mb-4 text-sm font-medium">
                  You have two options to access our services:
                </h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="isGemini"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Use Gemini Model</FormLabel>
                          <FormDescription>
                            Access our features with daily limitations and quota
                            limits. (Gemini Model)
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={handleGeminiChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  {!form.watch("isGemini") && (
                    <>
                      <FormField
                        control={form.control}
                        name="isServiceApiKey"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Use our service key.</FormLabel>
                              <FormDescription>
                                Access our features with daily limitations and
                                quota limits.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={handleServiceKeyChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="isCustomApiKey"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Use your own OpenAI key</FormLabel>
                              <FormDescription>
                                Enjoy our features for free without any messages
                                limitations.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={handleCustomKeyChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      {form.watch("isCustomApiKey") && (
                        <FormField
                          control={form.control}
                          name="openAPIKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Open AI Key</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder=""
                                  {...field}
                                  type={openAIKey ? "password" : "text"}
                                />
                              </FormControl>
                              <FormDescription>
                                You can generate your own Open AI Key at
                                <a href="https://platform.openai.com/api-keys">
                                  https://platform.openai.com/api-keys
                                </a>
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
              <Button type="submit" className="w-full">
                Submit
              </Button>
              <p className="text-xs text-rose-500">
                Rest assured, we do not store any of your information. All data
                related to your OpenAI key will be removed upon navigation.
              </p>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default ConfigForm;
