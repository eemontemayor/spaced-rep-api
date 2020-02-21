const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score',
      )
      .where('language.user_id', user_id)
      .first()
  },

  getLanguageWords(db, language_id) {
    return db
      .from('word')
      .select(
        'id',
        'original',
        'translation',
        'memory_value',
        'correct_count',
        'incorrect_count',
        'language_id',
        'next',
      )
      .where({ language_id })
  },


  //=======================================
  getHeadWord(db, user_id) {
    return db
      .from('word')
    //   .select(
    //     'id',
    //     'original',
    //     'translation',
    //     'memory_value',
    //     'correct_count',
    //     'incorrect_count',
    //     'language_id',
    //     'next',
    // )
    .select('word.*')
      .join('language', 'language.id', '=', 'word.language_id')
      .where('word.id', db.raw('language.head'))
      .andWhere({'language.user_id': user_id});
  },



  getTotalScore(db, user_id) {
    return db
      .from('language')
      .select('total_score')
      .where({ user_id });
  },
  //===============================
  updateUserLanguage(db, user_id, update) {
    return db
      .into('language')
      .update(
        // head: update.head,
        // total_score: update.total_score,
        update
      )
      .where({user_id})
      .returning('total_score');
  },

  updateWordById(db, id, update) {
    return db
      .into('word')
      .update(
        // next: update.next,
        // correct_count: update.correct_count,
        // incorrect_count: update.incorrect_count,
        // memory_value: update.memory_value,
        update
      )
      .where({id})
      .returning('*');
  },
  updateWordByNextId(db, next, update) {
    return db
      .into('word')
      .update(
        // next: update.next,
        // correct_count: update.correct_count,
        // incorrect_count: update.incorrect_count,
        // memory_value: update.memory_value,
        update
      )
      .where({next})
      .returning('*');
  },
  getWordById(db, wordId){
    return db
      .from('word')
      .select('word.*')
      .join('language', 'language.id', '=', 'word.language_id')
      .where({ 'word.id': wordId })

  },
  deleteWordById(db, wordId){
    return db
      .from('word')
      .join('language', 'language.id', '=', 'word.language_id')
      .where({ 'word.id': wordId })
      .delete()

  },
  insertWord(db, newWord) {
    return db
      .insert(newWord)
      .into('word')
      .returning('*')
      .then(rows => {
          return rows[0]
      })
  }
}

module.exports = LanguageService

