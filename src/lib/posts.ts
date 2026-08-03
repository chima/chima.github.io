import { getCollection, type CollectionEntry } from 'astro:content';
import { WORDS_PER_MINUTE } from '../consts';

export type Post = CollectionEntry<'blog'>;

/** Published posts, newest first. */
export async function getPosts(): Promise<Post[]> {
	const posts = await getCollection('blog', ({ data }) => data.draft !== true);
	return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** Whole minutes, minimum 1. Counted from the raw body — no remark plugin needed. */
export function readingMinutes(body: string | undefined): number {
	const words = (body || '').trim().split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/** Posts bucketed by year, newest year first. */
export function groupByYear(posts: Post[]): { year: number; posts: Post[] }[] {
	const map = new Map<number, Post[]>();
	for (const post of posts) {
		const year = post.data.pubDate.getFullYear();
		if (!map.has(year)) map.set(year, []);
		map.get(year)!.push(post);
	}
	return [...map.entries()]
		.sort((a, b) => b[0] - a[0])
		.map(([year, list]) => ({ year, posts: list }));
}

/** Every tag with its post count, most used first. */
export function tagCounts(posts: Post[]): { tag: string; count: number }[] {
	const counts = new Map<string, number>();
	for (const post of posts) {
		for (const tag of post.data.tags) {
			counts.set(tag, (counts.get(tag) || 0) + 1);
		}
	}
	return [...counts.entries()]
		.map(([tag, count]) => ({ tag, count }))
		.sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}
