import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Upload, Edit, Trash2, Crop, Resize, Download, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  characterId?: string;
  uploadedBy: string;
  createdAt: string;
}

interface Character {
  id: string;
  name: string;
  isNsfw: boolean;
}

interface ImageEditOptions {
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  resize?: {
    width: number;
    height: number;
  };
  format?: string;
  quality?: number;
}

interface ImageManagerProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function ImageManager({ isOpen, onClose }: ImageManagerProps = {}) {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedCharacter, setSelectedCharacter] = useState<string>("all");
  const [filterNSFW, setFilterNSFW] = useState<string>("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [editingImage, setEditingImage] = useState<MediaFile | null>(null);
  const [editOptions, setEditOptions] = useState<ImageEditOptions>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch media files
  const { data: mediaFiles = [], isLoading: mediaLoading } = useQuery({
    queryKey: ['/api/media', { characterId: selectedCharacter, nsfw: filterNSFW, sortBy }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedCharacter && selectedCharacter !== "all") params.append('characterId', selectedCharacter);
      if (filterNSFW !== "all") params.append('nsfw', filterNSFW);
      params.append('sortBy', sortBy);
      return fetch(`/api/media?${params}`).then(res => res.json());
    }
  });

  // Fetch characters
  const { data: characters = [] } = useQuery({
    queryKey: ['/api/admin/characters'],
    queryFn: () => fetch('/api/admin/characters').then(res => res.json())
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      setSelectedFiles(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast({ title: "Success", description: "Images uploaded successfully!" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/media/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      toast({ title: "Success", description: "Image deleted successfully!" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Edit mutation
  const editMutation = useMutation({
    mutationFn: ({ id, options }: { id: string; options: ImageEditOptions }) =>
      apiRequest(`/api/media/${id}/edit`, { method: 'POST', body: options }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      setEditingImage(null);
      setEditOptions({});
      toast({ title: "Success", description: "Image edited successfully!" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Assign to character mutation
  const assignMutation = useMutation({
    mutationFn: ({ id, characterId }: { id: string; characterId: string }) =>
      apiRequest(`/api/media/${id}/assign`, { method: 'POST', body: { characterId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      toast({ title: "Success", description: "Image assigned to character!" });
    }
  });

  const handleUpload = () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({ title: "Error", description: "Please select files to upload", variant: "destructive" });
      return;
    }

    const formData = new FormData();
    Array.from(selectedFiles).forEach(file => {
      formData.append('images', file);
    });
    formData.append('userId', 'mock-user-id'); // Replace with actual user ID
    if (selectedCharacter) {
      formData.append('characterId', selectedCharacter);
    }

    uploadMutation.mutate(formData);
  };

  const handleEdit = () => {
    if (!editingImage || !editOptions) return;
    editMutation.mutate({ id: editingImage.id, options: editOptions });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Image Manager</h2>
          <p className="text-muted-foreground">
            Upload, edit, and manage character images with advanced editing tools
          </p>
        </div>
      </div>

      <Tabs defaultValue="gallery" className="space-y-4">
        <TabsList>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="bulk-edit">Bulk Edit</TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Images
              </CardTitle>
              <CardDescription>
                Upload multiple images with automatic processing and optimization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="file-upload">Select Images</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={(e) => setSelectedFiles(e.target.files)}
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Supports: JPG, PNG, WebP, GIF (Max 10MB each, 10 files max)
                  </p>
                </div>

                <div>
                  <Label htmlFor="character-select">Assign to Character (Optional)</Label>
                  <Select value={selectedCharacter} onValueChange={setSelectedCharacter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a character..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No character</SelectItem>
                      {characters.map((char: Character) => (
                        <SelectItem key={char.id} value={char.id}>
                          {char.name} {char.isNsfw && <Badge variant="secondary">NSFW</Badge>}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedFiles && selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Files ({selectedFiles.length})</Label>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {Array.from(selectedFiles).map((file, index) => (
                        <div key={index} className="flex items-center justify-between text-sm bg-muted p-2 rounded">
                          <span>{file.name}</span>
                          <span className="text-muted-foreground">{formatFileSize(file.size)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleUpload} 
                  disabled={!selectedFiles || selectedFiles.length === 0 || uploadMutation.isPending}
                  className="w-full"
                >
                  {uploadMutation.isPending ? "Uploading..." : "Upload Images"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="character-filter">Character:</Label>
                  <Select value={selectedCharacter} onValueChange={setSelectedCharacter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All characters" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All characters</SelectItem>
                      {characters.map((char: Character) => (
                        <SelectItem key={char.id} value={char.id}>
                          {char.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Label htmlFor="nsfw-filter">NSFW Filter:</Label>
                  <Select value={filterNSFW} onValueChange={setFilterNSFW}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="true">NSFW Only</SelectItem>
                      <SelectItem value="false">SFW Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Label htmlFor="sort-by">Sort by:</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Date</SelectItem>
                      <SelectItem value="filename">Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Image Grid */}
          {mediaLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {mediaFiles.map((file: MediaFile) => (
                <Card key={file.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                  <div className="aspect-square relative">
                    <img
                      src={file.path}
                      alt={file.originalName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="secondary">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>{file.originalName}</DialogTitle>
                              <DialogDescription>
                                {formatFileSize(file.size)} • {file.mimeType}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-center">
                              <img
                                src={file.path}
                                alt={file.originalName}
                                className="max-h-[60vh] object-contain"
                              />
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="secondary" onClick={() => setEditingImage(file)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Edit Image</DialogTitle>
                              <DialogDescription>
                                Apply transformations to create a new version
                              </DialogDescription>
                            </DialogHeader>
                            <ImageEditDialog 
                              image={editingImage} 
                              options={editOptions}
                              setOptions={setEditOptions}
                              onEdit={handleEdit}
                              isLoading={editMutation.isPending}
                            />
                          </DialogContent>
                        </Dialog>

                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => deleteMutation.mutate(file.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <p className="text-sm font-medium truncate">{file.originalName}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    {file.characterId && (
                      <Badge variant="outline" className="mt-1">
                        {characters.find((c: Character) => c.id === file.characterId)?.name || 'Unknown Character'}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!mediaLoading && mediaFiles.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No images found</h3>
                <p className="text-muted-foreground mb-4">
                  Upload some images to get started with your gallery
                </p>
                <Button onClick={() => fileInputRef.current?.click()}>
                  Upload Images
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Bulk Edit Tab */}
        <TabsContent value="bulk-edit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Operations</CardTitle>
              <CardDescription>
                Perform operations on multiple images at once
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Bulk editing features coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Image Edit Dialog Component
function ImageEditDialog({ 
  image, 
  options, 
  setOptions, 
  onEdit, 
  isLoading 
}: {
  image: MediaFile | null;
  options: ImageEditOptions;
  setOptions: (options: ImageEditOptions) => void;
  onEdit: () => void;
  isLoading: boolean;
}) {
  if (!image) return null;

  return (
    <div className="space-y-4">
      <Tabs defaultValue="resize" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="resize">Resize</TabsTrigger>
          <TabsTrigger value="crop">Crop</TabsTrigger>
          <TabsTrigger value="format">Format</TabsTrigger>
        </TabsList>

        <TabsContent value="resize" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                type="number"
                placeholder="Width"
                value={options.resize?.width || ''}
                onChange={(e) => setOptions({
                  ...options,
                  resize: { ...options.resize, width: parseInt(e.target.value) || 0, height: options.resize?.height || 0 }
                })}
              />
            </div>
            <div>
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                type="number"
                placeholder="Height"
                value={options.resize?.height || ''}
                onChange={(e) => setOptions({
                  ...options,
                  resize: { ...options.resize, height: parseInt(e.target.value) || 0, width: options.resize?.width || 0 }
                })}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="crop" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="crop-x">X Position</Label>
              <Input
                id="crop-x"
                type="number"
                placeholder="X"
                value={options.crop?.x || ''}
                onChange={(e) => setOptions({
                  ...options,
                  crop: { ...options.crop, x: parseInt(e.target.value) || 0, y: options.crop?.y || 0, width: options.crop?.width || 0, height: options.crop?.height || 0 }
                })}
              />
            </div>
            <div>
              <Label htmlFor="crop-y">Y Position</Label>
              <Input
                id="crop-y"
                type="number"
                placeholder="Y"
                value={options.crop?.y || ''}
                onChange={(e) => setOptions({
                  ...options,
                  crop: { ...options.crop, y: parseInt(e.target.value) || 0, x: options.crop?.x || 0, width: options.crop?.width || 0, height: options.crop?.height || 0 }
                })}
              />
            </div>
            <div>
              <Label htmlFor="crop-width">Crop Width</Label>
              <Input
                id="crop-width"
                type="number"
                placeholder="Width"
                value={options.crop?.width || ''}
                onChange={(e) => setOptions({
                  ...options,
                  crop: { ...options.crop, width: parseInt(e.target.value) || 0, x: options.crop?.x || 0, y: options.crop?.y || 0, height: options.crop?.height || 0 }
                })}
              />
            </div>
            <div>
              <Label htmlFor="crop-height">Crop Height</Label>
              <Input
                id="crop-height"
                type="number"
                placeholder="Height"
                value={options.crop?.height || ''}
                onChange={(e) => setOptions({
                  ...options,
                  crop: { ...options.crop, height: parseInt(e.target.value) || 0, x: options.crop?.x || 0, y: options.crop?.y || 0, width: options.crop?.width || 0 }
                })}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="format" className="space-y-4">
          <div>
            <Label htmlFor="format-select">Output Format</Label>
            <Select value={options.format || ''} onValueChange={(value) => setOptions({ ...options, format: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Keep original format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Keep original</SelectItem>
                <SelectItem value="jpeg">JPEG</SelectItem>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="webp">WebP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {options.format && (
            <div>
              <Label htmlFor="quality">Quality: {options.quality || 90}%</Label>
              <Slider
                value={[options.quality || 90]}
                onValueChange={(value) => setOptions({ ...options, quality: value[0] })}
                max={100}
                min={1}
                step={1}
                className="mt-2"
              />
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setOptions({})}>
          Reset
        </Button>
        <Button onClick={onEdit} disabled={isLoading}>
          {isLoading ? "Processing..." : "Apply Changes"}
        </Button>
      </div>
    </div>
  );
}