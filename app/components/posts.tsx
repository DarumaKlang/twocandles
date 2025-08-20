import Link from 'next/link'

// ตั้งค่า Endpoint
const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL

// ฟังก์ชันสำหรับส่ง GraphQL query ไปยัง WordPress
async function fetchAPI(query = '') {
    const res = await fetch(WORDPRESS_API_URL!, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query,
        }),
    });

    const json = await res.json();
    if (json.errors) {
        console.error(json.errors);
        throw new Error('Failed to fetch API');
    }
    return json.data;
}

// ฟังก์ชันสำหรับดึงข้อมูลโพสต์ทั้งหมด
async function getAllPosts() {
    const data = await fetchAPI(`
    query AllPosts {
      posts(first: 20, where: { orderby: { field: DATE, order: DESC } }) {
        edges {
          node {
            title
            excerpt
            slug
            date
          }
        }
      }
    }
  `);

    return data.posts.edges.map(({ node }: any) => node);
}

// ฟังก์ชันสำหรับจัดรูปแบบวันที่
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options as any);
};

export async function BlogPosts() {
    const allBlogs = await getAllPosts();

    return (
        <div>
            {allBlogs.map((post: any) => (
                <Link
                    key={post.slug}
                    className="flex flex-col space-y-1 mb-4"
                    href={`/blog/${post.slug}`}
                >
                    <div className="w-full flex flex-col md:flex-row space-x-0 md:space-x-2">
                        <p className="text-neutral-600 dark:text-neutral-400 w-[100px] tabular-nums">
                            {formatDate(post.date)}
                        </p>
                        <p className="text-neutral-900 dark:text-neutral-100 tracking-tight">
                            {post.title}
                        </p>
                    </div>
                </Link>
            ))}
        </div>
    );
}