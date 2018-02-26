<?php

namespace Drupal\anu_user;

class UserAuth extends \Drupal\user\UserAuth {

  /**
   * {@inheritdoc}
   *
   * Mostly copied from the parent method, apart from
   * email authentication.
   */
  public function authenticate($username, $password) {
    $uid = FALSE;

    if (!empty($username) && strlen($password) > 0) {

      $properties = ['name' => $username];

      // Enhanced core's authentication function to include check
      // if user is using email to login.
      if (\Drupal::service('email.validator')->isValid($username)) {
        $properties = ['mail' => $username];
      }

      $account_search = $this->entityManager
        ->getStorage('user')
        ->loadByProperties($properties);

      if ($account = reset($account_search)) {
        if ($this->passwordChecker->check($password, $account->getPassword())) {
          // Successful authentication.
          $uid = $account->id();

          // Update user to new password scheme if needed.
          if ($this->passwordChecker->needsRehash($account->getPassword())) {
            $account->setPassword($password);
            $account->save();
          }
        }
      }
    }

    return $uid;
  }
}