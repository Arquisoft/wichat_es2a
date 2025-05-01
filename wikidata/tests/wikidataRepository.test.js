jest.mock('../src/model/wikidataModel', () => ({
  Question: {
    find: jest.fn(),
    insertMany: jest.fn(),
    aggregate: jest.fn(),
    deleteMany: jest.fn(),
    countDocuments: jest.fn(),
    deleteOne: jest.fn()
  }
}));

const { Question } = require('../src/model/wikidataModel');
const repository = require('../src/repositories/wikidataRepository');

describe('wikidataRepository core methods (unit tests, sin BD)', () => {
  const dummyMongoose = { connection: { readyState: 1 }, connect: jest.fn() };
  const dummyUri = 'mongodb://test:27017/mockdb';

  beforeEach(() => {
    jest.clearAllMocks();
    repository.init(dummyMongoose, dummyUri);
  });

  describe('init', () => {
    it('debe asignar mongooseInstance y uri', () => {
      const newM = { connection: { readyState: 0 }, connect: jest.fn() };
      const newUri = 'uri2';
      repository.init(newM, newUri);
      expect(repository.mongooseInstance).toBe(newM);
      expect(repository.uri).toBe(newUri);
    });
  });

  describe('checkUp', () => {
    it('resuelve cuando readyState es 1 (ya conectado)', async () => {
      dummyMongoose.connection.readyState = 1;
      await expect(repository.checkUp()).resolves.toBeUndefined();
      expect(dummyMongoose.connect).not.toHaveBeenCalled();
    });

    it('llama a mongoose.connect cuando readyState no es 1', async () => {
      dummyMongoose.connection.readyState = 0;
      dummyMongoose.connect.mockResolvedValue();
      await expect(repository.checkUp()).resolves.toBeUndefined();
      expect(dummyMongoose.connect).toHaveBeenCalledWith(dummyUri);
    });

    it('lanza error si mongoose o uri no están inicializados', async () => {
      repository.mongooseInstance = null;
      repository.uri = null;
      await expect(repository.checkUp())
        .rejects
        .toThrow("Error: mongoose or uri is not initialized. Call `init()` first.");
    });

    it('lanza error si connect falla', async () => {
      dummyMongoose.connection.readyState = 0;
      dummyMongoose.connect.mockRejectedValue(new Error('fail'));
      const spyErr = jest.spyOn(console, 'error').mockImplementation(() => {});
      await expect(repository.checkUp())
        .rejects
        .toThrow('Error connecting to MongoDB: fail');
      expect(spyErr).toHaveBeenCalledWith('Error connecting to MongoDB:', 'fail');
      spyErr.mockRestore();
    });
  });

  describe('getAllQuestions', () => {
    beforeEach(() => {
      repository.checkUp = jest.fn().mockResolvedValue();
    });

    it('devuelve preguntas', async () => {
      const docs = [{}, {}];
      Question.find.mockResolvedValue(docs);
      const res = await repository.getAllQuestions();
      expect(Question.find).toHaveBeenCalledWith({});
      expect(res).toBe(docs);
    });

    it('lanza error si falla find', async () => {
      Question.find.mockRejectedValue(new Error('err find'));
      await expect(repository.getAllQuestions())
        .rejects
        .toThrow('Error getting all questions: err find');
    });
  });

  describe('insertQuestions', () => {
    beforeEach(() => {
      repository.checkUp = jest.fn().mockResolvedValue();
    });

    it('inserta preguntas', async () => {
      const arr = [{}, {}];
      Question.insertMany.mockResolvedValue();
      await repository.insertQuestions(arr);
      expect(Question.insertMany).toHaveBeenCalledWith(arr);
    });

    it('lanza error si insertMany falla', async () => {
      Question.insertMany.mockRejectedValue(new Error('err ins'));
      await expect(repository.insertQuestions([{}]))
        .rejects
        .toThrow('Error inserting questions: err ins');
    });
  });

  describe('getQuestions', () => {
    beforeEach(() => {
      repository.checkUp = jest.fn().mockResolvedValue();
    });

    it('usa aggregate con $match y $sample', async () => {
      const sample = [{ a: 1 }];
      Question.aggregate.mockResolvedValue(sample);
      const res = await repository.getQuestions('Cat', 3);
      expect(Question.aggregate).toHaveBeenCalledWith([
        { $match: { category: 'Cat' } },
        { $sample: { size: 3 } }
      ]);
      expect(res).toBe(sample);
    });

    it('lanza error si aggregate falla', async () => {
      Question.aggregate.mockRejectedValue(new Error('err agg'));
      await expect(repository.getQuestions('C', 1))
        .rejects
        .toThrow('Error getting questions: err agg');
    });
  });

  describe('getAllQuestionsFromCategory', () => {
    beforeEach(() => {
      repository.checkUp = jest.fn().mockResolvedValue();
    });

    it('encuentra por categoría', async () => {
      const docs = [{}];
      Question.find.mockResolvedValue(docs);
      const res = await repository.getAllQuestionsFromCategory('Cat2');
      expect(Question.find).toHaveBeenCalledWith({ category: 'Cat2' });
      expect(res).toBe(docs);
    });

    it('lanza error si find falla', async () => {
      Question.find.mockRejectedValue(new Error('err findCat'));
      await expect(repository.getAllQuestionsFromCategory('X'))
        .rejects
        .toThrow('Error getting all questions from category X: err findCat');
    });
  });

  describe('deleteQuestions', () => {
    beforeEach(() => {
      repository.checkUp = jest.fn().mockResolvedValue();
    });

    it('borra todas', async () => {
      Question.deleteMany.mockResolvedValue();
      await repository.deleteQuestions();
      expect(Question.deleteMany).toHaveBeenCalledWith({});
    });

    it('lanza error si deleteMany falla', async () => {
      Question.deleteMany.mockRejectedValue(new Error('err delMany'));
      await expect(repository.deleteQuestions())
        .rejects
        .toThrow('Error deleting questions:err delMany');
    });
  });

  describe('existsQuestions', () => {
    beforeEach(() => {
      repository.checkUp = jest.fn().mockResolvedValue();
    });

    it('devuelve true si count > 0', async () => {
      Question.countDocuments.mockResolvedValue(5);
      const r = await repository.existsQuestions('Any');
      expect(Question.countDocuments).toHaveBeenCalledWith({ category: 'Any' });
      expect(r).toBe(true);
    });

    it('devuelve false si count = 0', async () => {
      Question.countDocuments.mockResolvedValue(0);
      const r = await repository.existsQuestions('Any');
      expect(r).toBe(false);
    });

    it('lanza error si countDocuments falla', async () => {
      Question.countDocuments.mockRejectedValue(new Error('err cnt'));
      await expect(repository.existsQuestions('Cat'))
        .rejects
        .toThrow('Error checking questions: err cnt');
    });
  });

  describe('deleteQuestion', () => {
    beforeEach(() => {
      repository.checkUp = jest.fn().mockResolvedValue();
    });

    it('borra por id y loggea', async () => {
      const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
      Question.deleteOne.mockResolvedValue();
      await repository.deleteQuestion('id1');
      expect(Question.deleteOne).toHaveBeenCalledWith({ _id: 'id1' });
      expect(spy).toHaveBeenCalledWith('Question with id id1 deleted successfully');
      spy.mockRestore();
    });

    it('lanza error si deleteOne falla', async () => {
      Question.deleteOne.mockRejectedValue(new Error('err delOne'));
      await expect(repository.deleteQuestion('i2'))
        .rejects
        .toThrow('Error deleting question: err delOne');
    });
  });
});
