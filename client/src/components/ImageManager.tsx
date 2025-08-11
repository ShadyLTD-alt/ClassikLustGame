import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, Trash2, Edit, Image as ImageIcon } from "lucide-react";

interface ImageManagerProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function ImageManager({ isOpen, onClose }: ImageManagerProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<string>("");
  const [uploadCategory, setUploadCategory] = useState<string>("character");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch media files
  const { data: mediaFiles = [], isLoading } = useQuery({
    queryKey: ['/api/media'],
    queryFn: () => fetch('/api/media').then(res => res.json()),
    enabled: isOpen
  });

  // Fetch characters for assignment
  const { data: characters = [] } = useQuery({
    queryKey: ['/api/admin/characters'],
    queryFn: () => fetch('/api/admin/characters').then(res => res.json()),
    enabled: isOpen
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/media'] });
      toast({ title: "Success", description: "Files uploaded successfully!" });
      setSelectedFiles(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const response = await fetch(`/api/media/${fileId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Delete failed');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/media'] });
      toast({ title: "Success", description: "File deleted successfully!" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(event.target.files);
  };

  const handleUpload = () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({ title: "Error", description: "Please select files to upload", variant: "destructive" });
      return;
    }

    const formData = new FormData();

    // Add files
    Array.from(selectedFiles).forEach(file => {
      formData.append('images', file);
    });

    // Add metadata
    formData.append('characterId', selectedCharacter);
    formData.append('userId', 'mock-user-id');
    formData.append('category', uploadCategory);

    uploadMutation.mutate(formData);
  };

  const handleDelete = (fileId: string) => {
    if (confirm('Are you sure you want to delete this file?')) {
      deleteMutation.mutate(fileId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="bg-black/20 backdrop-blur-sm border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Images
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Character Assignment
              </label>
              <Select value={selectedCharacter} onValueChange={setSelectedCharacter}>
                <SelectTrigger className="bg-black/30 border-white/20 text-white">
                  <SelectValue placeholder="Select character (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">No specific character</SelectItem>
                  {characters.map((char: any) => (
                    <SelectItem key={char.id} value={char.id}>
                      {char.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Category
              </label>
              <Select value={uploadCategory} onValueChange={setUploadCategory}>
                <SelectTrigger className="bg-black/30 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="character">Character Image</SelectItem>
                  <SelectItem value="background">Background</SelectItem>
                  <SelectItem value="avatar">Avatar</SelectItem>
                  <SelectItem value="misc">Miscellaneous</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Select Files
              </Button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {selectedFiles && selectedFiles.length > 0 && (
            <div className="border border-white/20 rounded-lg p-4">
              <div className="text-white mb-2">
                Selected Files ({selectedFiles.length}):
              </div>
              <div className="space-y-1">
                {Array.from(selectedFiles).map((file, index) => (
                  <div key={index} className="text-gray-300 text-sm">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                ))}
              </div>
              <Button
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
                className="mt-4 bg-green-600 hover:bg-green-700"
              >
                {uploadMutation.isPending ? "Uploading..." : "Upload Files"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Media Gallery */}
      <Card className="bg-black/20 backdrop-blur-sm border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white">Media Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-white text-center py-8">Loading images...</div>
          ) : mediaFiles.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-400">No media files found</div>
              <div className="text-gray-500 text-sm">Upload some images to get started</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {mediaFiles.map((file: any) => (
                <div key={file.id} className="relative group">
                  <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
                    <img
                      src={file.path}
                      alt={file.originalName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/api/placeholder-image';
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-white border-white/50"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(file.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-white mt-1 truncate">
                    {file.originalName}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}