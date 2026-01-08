import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Plus,
    Trash2,
    Save,
    Loader2,
    GripVertical,
    Eye,
    EyeOff,
    User,
    Target,
    Lightbulb,
    Briefcase,
    GraduationCap,
    Trophy,
    Zap,
    Code,
    ArrowUp,
    ArrowDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Types
interface ContentItem {
    id: string;
    section_type: string;
    title: string;
    subtitle: string | null;
    content: string | null;
    icon_name: string | null;
    date_start: string | null;
    date_end: string | null;
    location: string | null;
    organization: string | null;
    url: string | null;
    tags: string[];
    display_order: number;
    is_visible: boolean;
    metadata: Record<string, any>;
}

// Section configurations
const SECTIONS = [
    { key: 'about_me', label: 'About Me', icon: User, description: 'Your bio and introduction' },
    { key: 'vision', label: 'My Vision', icon: Lightbulb, description: 'Your vision statement' },
    { key: 'mission', label: 'My Mission', icon: Target, description: 'Your mission statement' },
    { key: 'core_competency', label: 'Core Competencies', icon: Zap, description: 'Key areas of expertise' },
    { key: 'experience', label: 'Experience', icon: Briefcase, description: 'Work experience and roles' },
    { key: 'education', label: 'Education', icon: GraduationCap, description: 'Educational background' },
    { key: 'achievement', label: 'Achievements / Publications', icon: Trophy, description: 'Awards, accomplishments and papers' },
    { key: 'skill', label: 'Skills', icon: Code, description: 'Technical and soft skills' },
    { key: 'technology', label: 'Technologies', icon: Zap, description: 'Technologies you work with' },
];

// Empty item template
const getEmptyItem = (sectionType: string): Omit<ContentItem, 'id'> => ({
    section_type: sectionType,
    title: '',
    subtitle: null,
    content: null,
    icon_name: null,
    date_start: null,
    date_end: null,
    location: null,
    organization: null,
    url: null,
    tags: [],
    display_order: 0,
    is_visible: true,
    metadata: {}
});

// Content Item Editor Component
function ContentItemEditor({
    item,
    sectionType,
    onSave,
    onDelete,
    onCancel,
    isNew = false
}: {
    item: Partial<ContentItem>;
    sectionType: string;
    onSave: (item: Partial<ContentItem>) => void;
    onDelete?: () => void;
    onCancel?: () => void;
    isNew?: boolean;
}) {
    const [formData, setFormData] = useState(item);
    const [tagInput, setTagInput] = useState('');

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addTag = () => {
        if (tagInput.trim()) {
            updateField('tags', [...(formData.tags || []), tagInput.trim()]);
            setTagInput('');
        }
    };

    const removeTag = (index: number) => {
        updateField('tags', (formData.tags || []).filter((_, i) => i !== index));
    };

    // Determine which fields to show based on section type
    const showOrganization = ['experience', 'education', 'achievement'].includes(sectionType);
    const showDates = ['experience', 'education', 'achievement'].includes(sectionType);
    const showLocation = ['experience', 'education'].includes(sectionType);
    const showSubtitle = ['experience', 'core_competency', 'skill', 'technology'].includes(sectionType);
    const showUrl = ['achievement', 'education'].includes(sectionType);
    const showTags = ['skill', 'technology', 'core_competency'].includes(sectionType);
    const showContent = true; // All sections have content

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border rounded-lg p-4 space-y-4 bg-card"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input
                        placeholder="Enter title..."
                        value={formData.title || ''}
                        onChange={(e) => updateField('title', e.target.value)}
                    />
                </div>

                {showSubtitle && (
                    <div className="space-y-2">
                        <Label>Subtitle / Category</Label>
                        <Input
                            placeholder="e.g., Senior Developer, Frontend"
                            value={formData.subtitle || ''}
                            onChange={(e) => updateField('subtitle', e.target.value)}
                        />
                    </div>
                )}

                {showOrganization && (
                    <div className="space-y-2">
                        <Label>Organization / Institution</Label>
                        <Input
                            placeholder="Company or institution name"
                            value={formData.organization || ''}
                            onChange={(e) => updateField('organization', e.target.value)}
                        />
                    </div>
                )}

                {showLocation && (
                    <div className="space-y-2">
                        <Label>Location</Label>
                        <Input
                            placeholder="City, Country"
                            value={formData.location || ''}
                            onChange={(e) => updateField('location', e.target.value)}
                        />
                    </div>
                )}

                {showDates && (
                    <>
                        <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input
                                placeholder="2020 or Jan 2020"
                                value={formData.date_start || ''}
                                onChange={(e) => updateField('date_start', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>End Date</Label>
                            <Input
                                placeholder="Present or Dec 2023"
                                value={formData.date_end || ''}
                                onChange={(e) => updateField('date_end', e.target.value)}
                            />
                        </div>
                    </>
                )}

                {showUrl && (
                    <div className="space-y-2 md:col-span-2">
                        <Label>URL / Link</Label>
                        <Input
                            placeholder="https://..."
                            value={formData.url || ''}
                            onChange={(e) => updateField('url', e.target.value)}
                        />
                    </div>
                )}
            </div>

            {showContent && (
                <div className="space-y-2">
                    <Label>Content / Description</Label>
                    <Textarea
                        placeholder="Enter content or description..."
                        value={formData.content || ''}
                        onChange={(e) => updateField('content', e.target.value)}
                        className="min-h-[100px]"
                    />
                </div>
            )}

            {showTags && (
                <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Add a tag..."
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addTag();
                                }
                            }}
                        />
                        <Button variant="outline" onClick={addTag} type="button">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {(formData.tags || []).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="gap-1">
                                {tag}
                                <button onClick={() => removeTag(index)} className="ml-1 hover:text-red-500">×</button>
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex gap-2 pt-2">
                <Button onClick={() => onSave(formData)} className="gap-2">
                    <Save className="w-4 h-4" />
                    {isNew ? 'Add' : 'Save'}
                </Button>
                {onCancel && (
                    <Button variant="outline" onClick={onCancel}>Cancel</Button>
                )}
                {onDelete && !isNew && (
                    <Button variant="destructive" onClick={onDelete} className="gap-2 ml-auto">
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </Button>
                )}
            </div>
        </motion.div>
    );
}

// Section Component
function SectionManager({
    sectionConfig
}: {
    sectionConfig: typeof SECTIONS[0];
}) {
    const { toast } = useToast();
    const [items, setItems] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Fetch items for this section
    useEffect(() => {
        fetchItems();
    }, [sectionConfig.key]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profile_content')
                .select('*')
                .eq('section_type', sectionConfig.key)
                .order('display_order', { ascending: true });

            if (error) throw error;
            setItems((data as ContentItem[]) || []);
        } catch (error: any) {
            console.error('Error fetching items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (itemData: Partial<ContentItem>, isNew: boolean = false) => {
        setSaving(itemData.id || 'new');
        try {
            if (isNew) {
                const newItem = {
                    ...getEmptyItem(sectionConfig.key),
                    ...itemData,
                    display_order: items.length
                };
                delete (newItem as any).id;

                const { error } = await supabase
                    .from('profile_content')
                    .insert(newItem);

                if (error) throw error;
                toast({ title: 'Added successfully' });
                setShowAddForm(false);
            } else {
                const { error } = await supabase
                    .from('profile_content')
                    .update(itemData)
                    .eq('id', itemData.id);

                if (error) throw error;
                toast({ title: 'Saved successfully' });
                setEditingId(null);
            }
            fetchItems();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setSaving(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            const { error } = await supabase
                .from('profile_content')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast({ title: 'Deleted successfully' });
            fetchItems();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    const toggleVisibility = async (item: ContentItem) => {
        try {
            const { error } = await supabase
                .from('profile_content')
                .update({ is_visible: !item.is_visible })
                .eq('id', item.id);

            if (error) throw error;
            fetchItems();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    const moveItem = async (item: ContentItem, direction: 'up' | 'down') => {
        const currentIndex = items.findIndex(i => i.id === item.id);
        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        if (targetIndex < 0 || targetIndex >= items.length) return;

        const targetItem = items[targetIndex];

        try {
            // Swap display_order values
            await supabase
                .from('profile_content')
                .update({ display_order: targetItem.display_order })
                .eq('id', item.id);

            await supabase
                .from('profile_content')
                .update({ display_order: item.display_order })
                .eq('id', targetItem.id);

            toast({ title: `Moved ${direction}` });
            fetchItems();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    const Icon = sectionConfig.icon;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-brand-blue" />
                        <CardTitle>{sectionConfig.label}</CardTitle>
                    </div>
                    <Button onClick={() => setShowAddForm(true)} className="gap-2" disabled={showAddForm}>
                        <Plus className="w-4 h-4" />
                        Add New
                    </Button>
                </div>
                <CardDescription>{sectionConfig.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <>
                        {/* Add Form */}
                        <AnimatePresence>
                            {showAddForm && (
                                <ContentItemEditor
                                    item={getEmptyItem(sectionConfig.key)}
                                    sectionType={sectionConfig.key}
                                    onSave={(item) => handleSave(item, true)}
                                    onCancel={() => setShowAddForm(false)}
                                    isNew
                                />
                            )}
                        </AnimatePresence>

                        {/* Existing Items */}
                        {items.length === 0 && !showAddForm ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Icon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>No items yet. Click "Add New" to create one.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {items.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className={`${!item.is_visible ? 'opacity-50' : ''}`}
                                    >
                                        {editingId === item.id ? (
                                            <ContentItemEditor
                                                item={item}
                                                sectionType={sectionConfig.key}
                                                onSave={(data) => handleSave({ ...item, ...data })}
                                                onDelete={() => handleDelete(item.id)}
                                                onCancel={() => setEditingId(null)}
                                            />
                                        ) : (
                                            <div className="flex items-center gap-4 p-4 border rounded-lg hover:border-brand-blue/30 transition-colors">
                                                <div className="flex flex-col gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => moveItem(item, 'up')}
                                                        disabled={items.indexOf(item) === 0}
                                                    >
                                                        <ArrowUp className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => moveItem(item, 'down')}
                                                        disabled={items.indexOf(item) === items.length - 1}
                                                    >
                                                        <ArrowDown className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium truncate">{item.title}</h4>
                                                    {item.subtitle && (
                                                        <p className="text-sm text-muted-foreground truncate">{item.subtitle}</p>
                                                    )}
                                                    {item.organization && (
                                                        <p className="text-sm text-muted-foreground truncate">{item.organization}</p>
                                                    )}
                                                    {item.content && (
                                                        <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{item.content}</p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {item.tags && item.tags.length > 0 && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            {item.tags.length} tags
                                                        </Badge>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleVisibility(item)}
                                                    >
                                                        {item.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setEditingId(item.id)}
                                                    >
                                                        Edit
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}

// Main Profile Content Manager Component
export default function ProfileContentManager() {
    return (
        <div className="space-y-6">
            <Tabs defaultValue="about_me" className="space-y-4">
                <TabsList className="w-full flex-wrap h-auto gap-1 p-1">
                    {SECTIONS.map((section) => {
                        const Icon = section.icon;
                        return (
                            <TabsTrigger key={section.key} value={section.key} className="gap-1 text-xs">
                                <Icon className="w-3 h-3" />
                                {section.label}
                            </TabsTrigger>
                        );
                    })}
                </TabsList>

                {SECTIONS.map((section) => (
                    <TabsContent key={section.key} value={section.key}>
                        <SectionManager sectionConfig={section} />
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
