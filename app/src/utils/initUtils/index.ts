import * as fs from 'fs';
import copy from 'recursive-copy';
import log from 'electron-log';
import * as sqlite3 from 'sqlite3';
import * as sqlite3Wrapper from './sqliteWrapper';
import { initializeDB, closeDB } from '../../db';
import {
  chatPaths,
  appDirectoryPath,
  dirPairings,
  addressBookDBAliasName,
} from './constants/directories';
import {
  findPossibleAddressBookDB,
  addContactNameColumn,
  setContactNameColumn,
} from '../../addressBro/util/index';
import {
  createAllChatTables,
  dropAllChatTables,
  createContactTable,
} from '../../tables';

export async function createAppDirectory() {
  try {
    if (!fs.existsSync(appDirectoryPath)) {
      fs.mkdirSync(appDirectoryPath);
      log.info('createAppDirectory success');
    }
  } catch (e) {
    log.error(`createAppDirectory error ${e}`);
  }
}

export async function copyFiles(
  originalPath: string,
  appPath: string
): Promise<void> {
  try {
    await copy(`${originalPath}`, `${appPath}`, {
      overwrite: true,
    });
    log.info(`copyFiles success to ${appPath}`);
  } catch (e) {
    log.error(`copyFiles failure: ${e}`);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getContactOptions(db: sqlite3.Database): Promise<any> {
  const q = `
  SELECT
    COALESCE(contact_name, h.id) as value,
    COALESCE(contact_name, h.id) as label,
    COUNT(*) as mycount,
    h.id
  FROM message
  JOIN handle h
    ON
      h.ROWID = handle_id
  GROUP BY h.id
  ORDER BY mycount DESC`;
  return sqlite3Wrapper.allP(db, q);
}

export async function coreInit(): Promise<sqlite3.Database> {
  // TODO: logic could be added here depending on what user wants to update their chat.db
  await createAppDirectory();
  await Promise.all(
    dirPairings.map(async (obj) => copyFiles(obj.original, obj.app))
  );
  const possibleAddressBookDB = await findPossibleAddressBookDB();
  const lorDB = initializeDB(chatPaths.app);
  await dropAllChatTables(lorDB);
  if (possibleAddressBookDB) {
    log.info(`Contacts found: ${possibleAddressBookDB}`);
    await createContactTable(possibleAddressBookDB);
    try {
      // Typescript thinks db.filename does not exist, but it does.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const q = `ATTACH '${possibleAddressBookDB.filename}' AS ${addressBookDBAliasName}`;
      await sqlite3Wrapper.runP(lorDB, q);
      log.info(`ATTACH success`, q);
    } catch (err) {
      log.error('ERROR ATTACH errored', err);
    }
    try {
      await addContactNameColumn(lorDB);
      log.info(`ContactName column added successully`);
    } catch (err) {
      log.warn('WARN add ContactName column already exists', err);
    }
    try {
      await setContactNameColumn(lorDB);
      log.info(`ContactName Column set successully`);
    } catch (err) {
      log.error('ERROR setContactNameColumn error', err);
    }
    closeDB(possibleAddressBookDB); // after setContactNameColumn, we have no use for this db
  } else {
    log.info('No contacts found.');
  }
  /*
   * NOTE:
   *  Whether or not the addressBook was found, we
   *  can use a COALESCE(contact_name, handle.id)
   *  to return the name or the phone
   */
  await createAllChatTables(lorDB);
  return lorDB;
}
