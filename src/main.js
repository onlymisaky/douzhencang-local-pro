fetch('/api/videos/likes?size=20')
  .then(res => res.json())
  .then(res => console.log('likes:', res));

fetch('/api/videos/bookmarked?size=30')
  .then(res => res.json())
  .then(res => console.log('bookmarked:', res));

fetch('/api/video/7385471705264819456')
  .then(res => res.json())
  .then(res => {
    console.log('video:', res)
    return res
  })
  .then(res => fetch(`/static/${res.id}.mp4`))
  .then(async (res) => {
    const reader = res.body.getReader();
    while (true) {
      let result = await reader.read();
      if (result.done) {
        break;
      }
      console.log(result.value);
    }
  })

fetch('/api/authors')
  .then(res => res.json())
  .then(res => console.log('authors:', res));

fetch('/api/author/96676298629/videos')
  .then(res => res.json())
  .then(res => console.log('2683238336 videos:', res));
