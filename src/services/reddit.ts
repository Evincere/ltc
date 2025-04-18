/**
 * Represents a Reddit post with its sentiment score.
 */
export interface RedditPost {
  /**
   * The title of the Reddit post.
   */
  title: string;
  /**
   * The content of the Reddit post.
   */
  content: string;
  /**
   * The sentiment score of the Reddit post.
   */
  sentimentScore: number;
}

/**
 * Asynchronously retrieves Reddit posts for a given cryptocurrency.
 *
 * @param subreddit The subreddit to retrieve posts from (e.g., 'Litecoin').
 * @param sortBy The sorting method (e.g., 'relevance', 'new').
 * @param limit The maximum number of posts to retrieve.
 * @returns A promise that resolves to an array of RedditPost objects.
 */
export async function getRedditPosts(
  subreddit: string,
  sortBy: string,
  limit: number
): Promise<RedditPost[]> {
  // TODO: Implement this by calling an API.

  return [
    {
      title: 'Litecoin is going up!',
      content: 'I think Litecoin will reach 100 soon.',
      sentimentScore: 0.8,
    },
    {
      title: 'Litecoin is not doing well.',
      content: 'Litecoin has been underperforming recently.',
      sentimentScore: -0.5,
    },
  ];
}
