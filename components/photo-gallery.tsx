"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Heart, Share2, Download, X } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface Photo {
  id: string
  title: string
  location: string
  photographer: string
  imageUrl: string
  likes: number
  tags: string[]
}

export function PhotoGallery() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [likedPhotos, setLikedPhotos] = useState<Set<string>>(new Set())

  const photos: Photo[] = [
    {
      id: "1",
      title: "Mount Fuji at Sunrise",
      location: "Fujiyoshida, Japan",
      photographer: "Yuki Tanaka",
      imageUrl: "/trips/mount-fuji.jpg",
      likes: 2340,
      tags: ["nature", "mountain", "sunrise"],
    },
    {
      id: "2",
      title: "Kyoto Bamboo Forest",
      location: "Arashiyama, Kyoto",
      photographer: "Sakura Yamamoto",
      imageUrl: "/trips/kyoto-bamboo.jpg",
      likes: 1890,
      tags: ["nature", "forest", "zen"],
    },
    {
      id: "3",
      title: "Tokyo Night Skyline",
      location: "Tokyo, Japan",
      photographer: "Kenji Sato",
      imageUrl: "/trips/tokyo-night.jpg",
      likes: 3120,
      tags: ["city", "night", "urban"],
    },
    {
      id: "4",
      title: "Cherry Blossoms in Bloom",
      location: "Ueno Park, Tokyo",
      photographer: "Hana Nakamura",
      imageUrl: "/trips/cherry-blossoms.jpg",
      likes: 4560,
      tags: ["nature", "spring", "flowers"],
    },
    {
      id: "5",
      title: "Traditional Geisha District",
      location: "Gion, Kyoto",
      photographer: "Takeshi Ito",
      imageUrl: "/trips/geisha-district.jpg",
      likes: 2780,
      tags: ["culture", "traditional", "street"],
    },
    {
      id: "6",
      title: "Osaka Castle",
      location: "Osaka, Japan",
      photographer: "Akira Suzuki",
      imageUrl: "/trips/osaka-castle.jpg",
      likes: 2150,
      tags: ["architecture", "history", "landmark"],
    },
  ]

  const filteredPhotos = photos.filter(
    (photo) =>
      photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const toggleLike = (photoId: string) => {
    const newLiked = new Set(likedPhotos)
    if (newLiked.has(photoId)) {
      newLiked.delete(photoId)
    } else {
      newLiked.add(photoId)
    }
    setLikedPhotos(newLiked)
  }

  return (
    <div>
      {/* Search Bar */}
      <Card className="p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by location, tags, or photographer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Photo Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPhotos.map((photo) => (
          <Card key={photo.id} className="overflow-hidden group cursor-pointer" onClick={() => setSelectedPhoto(photo)}>
            <div className="relative h-64 bg-muted overflow-hidden">
              <img
                src={photo.imageUrl || "/placeholder.svg"}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Quick Actions */}
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleLike(photo.id)
                  }}
                  className="w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                >
                  <Heart
                    className={`w-4 h-4 ${likedPhotos.has(photo.id) ? "fill-destructive text-destructive" : "text-foreground"}`}
                  />
                </button>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                >
                  <Share2 className="w-4 h-4 text-foreground" />
                </button>
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                {photo.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">{photo.location}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Heart className="w-4 h-4" />
                  <span>{photo.likes.toLocaleString()}</span>
                </div>
                <span className="text-xs text-muted-foreground">{photo.photographer}</span>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {photo.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 rounded-full bg-accent text-accent-foreground text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Photo Detail Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl p-0">
          {selectedPhoto && (
            <div className="grid md:grid-cols-2">
              <div className="relative h-[500px] bg-muted">
                <img
                  src={selectedPhoto.imageUrl || "/placeholder.svg"}
                  alt={selectedPhoto.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">{selectedPhoto.title}</h2>
                    <p className="text-muted-foreground">{selectedPhoto.location}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedPhoto(null)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 mb-6">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm font-semibold">{selectedPhoto.photographer.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{selectedPhoto.photographer}</p>
                    <p className="text-xs text-muted-foreground">Photographer</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 mb-6">
                  <Heart className="w-5 h-5 text-muted-foreground" />
                  <span className="font-semibold text-foreground">{selectedPhoto.likes.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground ml-1">likes</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedPhoto.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => toggleLike(selectedPhoto.id)}
                    variant={likedPhotos.has(selectedPhoto.id) ? "default" : "outline"}
                    className="flex-1"
                  >
                    <Heart className={`w-4 h-4 mr-2 ${likedPhotos.has(selectedPhoto.id) ? "fill-current" : ""}`} />
                    {likedPhotos.has(selectedPhoto.id) ? "Liked" : "Like"}
                  </Button>
                  <Button variant="outline">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" size="icon">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
