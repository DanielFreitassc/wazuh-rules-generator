'use client';

import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

// Tipos (pode mover para um arquivo types.ts se preferir)
export type RuleTag =
  | 'description'
  | 'group'
  | 'if_sid'
  | 'if_group'
  | 'if_matched_sid'
  | 'if_matched_group'
  | 'match'
  | 'regex'
  | 'decoded_as'
  | 'category'
  | 'field'
  | 'srcip'
  | 'dstip'
  | 'user'
  | 'program_name'
  | 'hostname'
  | 'list';

export interface ConditionAttributes {
  name?: string;
  negate?: 'yes' | 'no';
  type?: 'osmatch' | 'sregex' | 'pcre2';
}

export interface Condition {
  id: number;
  tag: RuleTag;
  value: string;
  attributes: ConditionAttributes;
}

// Importando os componentes shadcn/ui que você instalou
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import OutputDisplay from './OutputDisplay';


export default function RuleGenerator() {
    // --- ESTADO DO COMPONENTE ---
    const [ruleId, setRuleId] = useState<number>(100100);
    const [ruleLevel, setRuleLevel] = useState<number>(5);
    const [frequency, setFrequency] = useState<string>('');
    const [timeframe, setTimeframe] = useState<string>('');
    const [conditions, setConditions] = useState<Condition[]>([]);
    const [generatedRule, setGeneratedRule] = useState<string>('');

    // Opções para o dropdown, baseadas na documentação do Wazuh
    const availableTags: RuleTag[] = [
        'description', 'group', 'if_sid', 'if_group', 'match', 'regex',
        'decoded_as', 'category', 'field', 'srcip', 'dstip', 'user', 'program_name', 'hostname', 'list'
    ];
    
    // --- FUNÇÕES DE LÓGICA ---
    const addCondition = () => {
        const newCondition: Condition = { id: Date.now(), tag: 'field', value: '', attributes: {} };
        setConditions([...conditions, newCondition]);
    };

    const updateCondition = (id: number, updatedField: Partial<Condition>) => {
        setConditions(conditions.map(c => (c.id === id ? { ...c, ...updatedField } : c)));
    };
    
    const updateConditionAttribute = (id: number, attrName: keyof Condition['attributes'], attrValue: string | undefined) => {
        setConditions(conditions.map(c => {
            if (c.id === id) {
                const newAttributes = { ...c.attributes, [attrName]: attrValue };
                if (attrValue === undefined || attrValue === 'no' || attrValue === '') {
                    delete newAttributes[attrName];
                }
                return { ...c, attributes: newAttributes };
            }
            return c;
        }));
    };

    const removeCondition = (id: number) => {
        setConditions(conditions.filter(c => c.id !== id));
    };
    
    const handleGenerateRule = () => {
        let ruleAttrs = `id="${ruleId}" level="${ruleLevel}"`;
        if (frequency) ruleAttrs += ` frequency="${frequency}"`;
        if (timeframe) ruleAttrs += ` timeframe="${timeframe}"`;

        const conditionsXml = conditions.map(c => {
            let attrsString = '';
            for (const [key, val] of Object.entries(c.attributes)) {
                if (val) attrsString += ` ${key}="${val}"`;
            }
        
            // ### ALTERAÇÃO 1: LÓGICA DE GERAÇÃO ###
            // As tags 'match' e 'regex' foram removidas desta lista para que seus atributos possam ser adicionados.
            if (['description', 'group', 'if_sid', 'if_group', 'decoded_as', 'category'].includes(c.tag)) {
                 return `    <${c.tag}>${c.value}</${c.tag}>`;
            }
            return `    <${c.tag}${attrsString}>${c.value}</${c.tag}>`;
        }).join('\n');
        
        const ruleXml = `<rule ${ruleAttrs}>\n${conditionsXml}\n</rule>`;
        setGeneratedRule(ruleXml);
    };

    // --- RENDERIZAÇÃO DO JSX ---
    return (
        <TooltipProvider>
            <Card className="w-full max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl">Gerador de Regras Wazuh</CardTitle>
                    <CardDescription>Crie regras personalizadas de forma fácil e intuitiva.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Seção de Atributos da Regra */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">Atributos da Regra</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="ruleId">ID da Regra</Label>
                                <Input id="ruleId" type="number" value={ruleId} onChange={e => setRuleId(parseInt(e.target.value))} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ruleLevel">Level (0-16)</Label>
                                <Input id="ruleLevel" type="number" min="0" max="16" value={ruleLevel} onChange={e => setRuleLevel(parseInt(e.target.value))} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="frequency" className="flex items-center">
                                    Frequency
                                    <Tooltip>
                                        <TooltipTrigger asChild><HelpCircle className="w-4 h-4 ml-1.5 text-muted-foreground cursor-pointer" /></TooltipTrigger>
                                        <TooltipContent>
                                            <p>Define a contagem de eventos para correlação. [cite: 103]</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </Label>
                                <Input id="frequency" type="number" placeholder="ex: 8" value={frequency} onChange={e => setFrequency(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="timeframe">Timeframe (segundos)</Label>
                                <Input id="timeframe" type="number" placeholder="ex: 120" value={timeframe} onChange={e => setTimeframe(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* Seção de Condições */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">Condições e Opções da Regra</h3>
                        <div className="space-y-4">
                            {conditions.map(condition => (
                                <div key={condition.id} className="p-4 border rounded-lg bg-slate-50 space-y-3">
                                    <div className="flex items-start gap-2">
                                        <div className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-2">
                                            <Select value={condition.tag} onValueChange={(value: RuleTag) => updateCondition(condition.id, { tag: value, attributes: {} })}>
                                                <SelectTrigger><SelectValue placeholder="Tipo de Condição" /></SelectTrigger>
                                                <SelectContent>
                                                    {availableTags.map(tag => <SelectItem key={tag} value={tag}>{tag}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <div className="sm:col-span-2">
                                                <Input placeholder="Valor da tag" value={condition.value} onChange={e => updateCondition(condition.id, { value: e.target.value })} />
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => removeCondition(condition.id)}>
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    
                                    {/* ### ALTERAÇÃO 2: RENDERIZAÇÃO DOS ATRIBUTOS ### */}
                                    {/* Este bloco agora inclui a lógica para 'match' e 'regex' */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pl-1 pt-2">
                                        {condition.tag === 'field' && (
                                            <div className="space-y-2">
                                                <Label htmlFor={`attr-name-${condition.id}`}>Atributo 'name'</Label>
                                                <Input id={`attr-name-${condition.id}`} placeholder="ex: win.eventdata.targetUserName" value={condition.attributes.name || ''} onChange={e => updateConditionAttribute(condition.id, 'name', e.target.value)} />
                                            </div>
                                        )}
                                        {['srcip', 'dstip', 'user', 'hostname'].includes(condition.tag) && (
                                            <div className="space-y-2">
                                                <Label htmlFor={`attr-negate-${condition.id}`}>Atributo 'negate'</Label>
                                                <Select value={condition.attributes.negate || 'no'} onValueChange={(value: 'yes' | 'no') => updateConditionAttribute(condition.id, 'negate', value)}>
                                                    <SelectTrigger id={`attr-negate-${condition.id}`}><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="no">no</SelectItem>
                                                        <SelectItem value="yes">yes</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                        {['match', 'regex'].includes(condition.tag) && (
                                            <>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`attr-type-${condition.id}`}>Atributo 'type'</Label>
                                                    <Select value={condition.attributes.type || 'osmatch'} onValueChange={(value: 'osmatch' | 'sregex' | 'pcre2') => updateConditionAttribute(condition.id, 'type', value)}>
                                                        <SelectTrigger id={`attr-type-${condition.id}`}><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="osmatch">osmatch</SelectItem>
                                                            <SelectItem value="sregex">sregex</SelectItem>
                                                            <SelectItem value="pcre2">pcre2</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`attr-negate-${condition.id}`}>Atributo 'negate'</Label>
                                                    <Select value={condition.attributes.negate || 'no'} onValueChange={(value: 'yes' | 'no') => updateConditionAttribute(condition.id, 'negate', value)}>
                                                        <SelectTrigger id={`attr-negate-${condition.id}`}><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="no">no</SelectItem>
                                                            <SelectItem value="yes">yes</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="link" className="px-0" onClick={addCondition}>+ Adicionar Condição</Button>
                    </div>
                    
                    <Button onClick={handleGenerateRule} size="lg" className="w-full">Gerar Regra</Button>
                    
                    {generatedRule && <OutputDisplay xmlString={generatedRule} />}
                </CardContent>
            </Card>
        </TooltipProvider>
    );
}