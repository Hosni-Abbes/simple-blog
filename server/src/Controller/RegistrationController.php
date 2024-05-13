<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Constraints\Email as EmailConstraint;
use Symfony\Component\Validator\Validator\ValidatorInterface;


#[Route('/api/auth', name:'api')]
class RegistrationController extends AbstractController
{
    /** 
     * @var EntityManagerInterface $em
     */
    private $em;
    
    /**
     * @param EntityManagerInterface $em
     */
    public function __construct(EntityManagerInterface $em) {
        $this->em = $em;
    }
    
    #[Route('/register', name: 'register', methods:['POST'])]
    public function register(Request $request,ValidatorInterface $validator , UserPasswordHasherInterface $passwordHasher): JsonResponse
    {
        $name = $request->getPayload()->get('name');
        $email = $request->getPayload()->get('email');
        $password = $request->getPayload()->get('password');
        
        if(!$email || !$name || !$password) return $this->json(['message' => 'All fields are wrequired'], JsonResponse::HTTP_BAD_REQUEST);
        $name = htmlspecialchars(trim($name), HTML_ENTITIES, 'utf-8');
                
        $user = new User();
        $user->setName($name);
        $user->setEmail($email);
        $user->setPassword($passwordHasher->hashPassword($user, $password));

        $errors = $validator->validate($user);
        if(count($errors) > 0) return $this->json(['message' => (string) $errors], JsonResponse::HTTP_BAD_REQUEST);
    
        $this->em->persist($user);
        $this->em->flush();

        return $this->json(['message' => 'Success register!'], JsonResponse::HTTP_OK);
    }
}
