"use client"

interface FavoriteGenresProps {
  genres: string[]
  title?: string
}

export function FavoriteGenres({ genres, title = "Your Favorite Genres" }: FavoriteGenresProps) {
  // Array of colors for the genre badges
  const colors = [
    "bg-blue-600",
    "bg-purple-600",
    "bg-green-600",
    "bg-yellow-600",
    "bg-red-600",
    "bg-pink-600",
    "bg-indigo-600",
  ]

  return (
    <div className="bg-zinc-800 rounded-lg p-4">
      <h3 className="text-lg font-medium text-white mb-4">{title}</h3>
      
      {genres.length === 0 ? (
        <p className="text-zinc-400">No genres found.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {genres.map((genre, index) => (
            <span
              key={genre}
              className={`${colors[index % colors.length]} px-3 py-1.5 rounded-full text-sm font-medium text-white`}
            >
              {genre}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default FavoriteGenres 