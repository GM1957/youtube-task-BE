const {
  queryItem,
  putItem,
  updateItem,
  queryItemPaginated,
} = require("../Utils/DBClient");

const { okResponse, internalServerError, badRequestResponse } =
  require("../Utils/responseCodes").responseMessages;
const axios = require("axios");

const getYoutubeData = async (event) => {
  const { search, maxResults, afterDate } = event;
  let result = [];
  let url = `https://www.googleapis.com/youtube/v3/search?key=${process.env.FIRST_YOUTUBE_API_KEY}
      &part=snippet&q=${search}&maxResults=${maxResults}&publishedAfter=${afterDate}&order=date&type=video`;
  try {
    const response = await axios.get(url);
    result = response.data.items;
  } catch (err) {
    console.log("error", err);
    url = `https://www.googleapis.com/youtube/v3/search?key=${process.env.SECOND_YOUTUBE_API_KEY}
        &part=snippet&q=${search}&maxResults=${maxResults}&publishedAfter=${afterDate}&order=date&type=video`;
    try {
      const response = await axios.get(url);
      result = response.data.items;
    } catch (err) {
      console.log("error with second api key", err);
    }
  }
  return result;
};

const main = async () => {
  console.log("Inside Youtube corn function");

  const search = "cricket",
    maxResults = 20,
    afterDate = "2010-02-16T16:00:07Z";

  try {
    const promises = [];
    const dataItems = await getYoutubeData({ search, maxResults, afterDate });
    if (dataItems.length) {
      dataItems.forEach((item) => {
        const itemDetails = item.snippet;

        const insertQuery = {
          TableName: "YouTubeDataTable",
          Item: {
            searchTag: search,
            publishedAt: itemDetails.publishedAt,
            title: itemDetails.title,
            description: itemDetails.description,
            thumbnails: itemDetails.thumbnails,
            channelTitle: itemDetails.channelTitle,
            channelId: itemDetails.channelId,
          },
        };
        promises.push(putItem(insertQuery));
      });

      return Promise.all(promises)
        .then(() => okResponse("items updated"))
        .catch((err) => internalServerError(err));
    }
    return badRequestResponse("no data found");
  } catch (err) {
    return internalServerError(err);
  }
};

module.exports = { main };
