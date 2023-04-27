import { Telegraf, Markup } from "telegraf";
import mediaGroup from "telegraf-media-group";

const BOT_API = "";
const CHAT_ID = "";

const bot = new Telegraf(BOT_API);

bot.start((ctx) => {
  ctx.reply(
    "Привет! Это бот, который публикует объявление в канал. Фотки можно добавить в любой момент редактирования объявления. Для запуска нового описания введи команду /new"
  );
});

bot.use(mediaGroup());

// Функция для вывода инфы. При добавлении новых полей нужно поправить. Ну и вообще на свой вкус можно править.
const generateDescription = ({ name, price, url }) => {
  let result = `
  Название: ${name || ""}
Цена: ${price || ""}
Ссылка на маркетплейс: ${url || ""}
  `;
  return result;
};

// Объект, в который записываем пользовательский ввод
let caption = {
  name: null,
  price: null,
  url: null,
};

// Костыль для того, чтобы записывать пользовательский ввод в нужное поле объекта caption
let currentField = "";

// Сюда записываем данные о фотках
let photos = null;

bot.command("new", (ctx) => {
  // Обнуляем поля
  caption = {
    name: null,
    price: null,
    url: null,
  };
  currentField = "";
  photos = null;

  // Выводим клавиатуру
  ctx.reply(
    "Поехали!",
    Markup.keyboard([
      ["Ввести название", "Ввести цену"],
      ["Ввести ссылку", "🔎 Предпросмотр"],
      ["🏒 Херануть в канал!"],
    ]).resize()
  );
});

// Тут переключаем поля
bot.hears("Ввести название", () => {
  currentField = "name";
});

bot.hears("Ввести цену", () => {
  currentField = "price";
});

bot.hears("Ввести ссылку", () => {
  currentField = "url";
});

bot.hears("🔎 Предпросмотр", (ctx) => {
  const description = generateDescription(caption);
  console.log(photos);
  if (!photos) {
    ctx.reply(description, { disable_web_page_preview: true });
  } else if (Array.isArray(photos)) {
    photos[0].caption = description;
    ctx.replyWithMediaGroup(photos, { disable_web_page_preview: true });
  } else {
    ctx.replyWithPhoto(photos, {
      caption: description,
      disable_web_page_preview: true,
    });
  }
});

bot.hears("🏒 Херануть в канал!", async (ctx) => {
  const description = generateDescription(caption);
  if (!photos) {
    await ctx.telegram.sendMessage(CHAT_ID, description, {
      disable_web_page_preview: true,
    });
  } else if (Array.isArray(photos)) {
    photos[0].caption = description;
    // Отправляем альбом фотографий в канал
    await ctx.telegram.sendMediaGroup(CHAT_ID, photos, {
      disable_web_page_preview: true,
    });
  } else {
    await ctx.telegram.sendPhoto(CHAT_ID, photos, {
      caption: description,
      disable_web_page_preview: true,
    });
  }
});

// Тут записываем в поля в зависимости от значения переключателя
bot.on("text", (ctx) => {
  if (currentField) {
    caption[currentField] = ctx.message.text;
    console.log(caption[currentField]);
  }
  // Выводим клавиатуру
  ctx.reply(
    "Отлично! Что дальше?",
    Markup.keyboard([
      ["Ввести название", "Ввести цену"],
      ["Ввести ссылку", "🔎 Предпросмотр"],
      ["🏒 Херануть в канал!"],
    ]).resize()
  );
});

bot.on("media_group", async (ctx) => {
  photos = ctx.mediaGroup.map((p) => {
    return { type: "photo", media: p.photo[0].file_id };
  });
});

bot.on("photo", async (ctx) => {
  photos = ctx.update.message.photo[0].file_id;
});

bot.launch();
