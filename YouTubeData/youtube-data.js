const { scanItemPaginated } = require("../Utils/DBClient");

const {
  okResponse,
  internalServerError,
  badRequestResponse
} = require("../Utils/responseCodes").responseMessages;

const {
  containsExpresseionGeneratorForOR
} = require("../Utils/containsExpresseionGeneratorForOR");

const { customValidator } = require("../Utils/customValidator");

async function YoutubeDataSearch(event) {
  console.log("Inside postSearch function", event);

  const errors = customValidator(event, ["searchInput"]);
  if (errors.length)
    return badRequestResponse("missing mandetory fields", errors);

  const { searchInput, limit, LastEvaluatedKey } = event;

  const searchInputs = searchInput.split(" ");

  const containsArr = [searchInputs];

  if(searchInputs.length > 1){
    searchInputs.forEach(item => containsArr.push(item))
  }

  const containsExpRes = await containsExpresseionGeneratorForOR(
    "description",
    containsArr
  );

  const containsExpResTitle = await containsExpresseionGeneratorForOR(
    "title",
    containsArr
  );

  const params = {
    TableName: "YouTubeDataTable",
    ScanIndexForward: false,
    FilterExpression: containsExpRes.expression + " OR " + containsExpResTitle.expression,
    ExpressionAttributeValues: {
      ...containsExpRes.values
    }
  };

  if (limit && limit != "false") {
    params.Limit = limit;
  }
  
  if (LastEvaluatedKey && LastEvaluatedKey != "false") {
    params.ExclusiveStartKey = LastEvaluatedKey;
  }
  return scanItemPaginated(params)
    .then(result => okResponse("fetched result", result))
    .catch(err => internalServerError(err, "failed to fetch data"));
}

module.exports = { YoutubeDataSearch };
