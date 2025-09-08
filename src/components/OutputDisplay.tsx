'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OutputDisplayProps {
    xmlString: string;
}

export default function OutputDisplay({ xmlString }: OutputDisplayProps) {
    const [hasCopied, setHasCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(xmlString).then(() => {
            setHasCopied(true);
            setTimeout(() => {
                setHasCopied(false);
            }, 2000); // Reseta o ícone após 2 segundos
        });
    };

    return (
        <div className="mt-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Regra Gerada (XML)</CardTitle>
                    <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                        {hasCopied ? (
                            <Check className="w-4 h-4 text-green-500" />
                        ) : (
                            <Copy className="w-4 h-4" />
                        )}
                    </Button>
                </CardHeader>
                <CardContent>
                    <SyntaxHighlighter
                        language="xml"
                        style={vscDarkPlus}
                        customStyle={{
                            margin: 0,
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                        }}
                        wrapLongLines={true}
                    >
                        {xmlString}
                    </SyntaxHighlighter>
                </CardContent>
            </Card>
        </div>
    );
}