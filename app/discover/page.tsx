import { DestinationMap } from "@/components/destination-map"
import { PhotoGallery } from "@/components/photo-gallery"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppHeader } from "@/components/app-header"

export default function DiscoverPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Discover Destinations</h1>
            <p className="text-muted-foreground">Explore the world through interactive maps and stunning photography</p>
          </div>

          <Tabs defaultValue="map" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="map">Interactive Map</TabsTrigger>
              <TabsTrigger value="gallery">Photo Gallery</TabsTrigger>
            </TabsList>

            <TabsContent value="map" className="mt-6">
              <DestinationMap />
            </TabsContent>

            <TabsContent value="gallery" className="mt-6">
              <PhotoGallery />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
