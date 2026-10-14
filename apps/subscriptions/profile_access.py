from django.core import signing
from hashlib import sha256
from django.db.models import Q
from rest_framework.exceptions import PermissionDenied

SALT = "streamflix.profile-access"


def pin_fingerprint(profile):
    return sha256(profile.pin_code.encode()).hexdigest()


def access_token(profile):
    # Bind grants to the current hash so changing/removing a PIN revokes them.
    return signing.dumps({"profile": profile.pk, "user": profile.subscription.user_id,
                          "hash": pin_fingerprint(profile)}, salt=SALT)


def verified_profile(request):
    try:
        grant = signing.loads(request.headers.get("X-Profile-Access", ""), salt=SALT, max_age=3600)
        if grant["user"] == request.user.pk:
            return grant
    except (signing.BadSignature, KeyError, TypeError):
        pass
    return {}


def accessible_profiles(request):
    from .models import Profile
    grant = verified_profile(request)
    profile = Profile.objects.filter(pk=grant.get("profile"), subscription__user=request.user).first()
    verified_id = profile.pk if profile and grant.get("hash") == pin_fingerprint(profile) else -1
    return Q(profile__has_pin=False) | Q(profile_id=verified_id)


def require_profile_access(request, profile):
    if not profile.has_pin:
        return
    grant = verified_profile(request)
    if grant.get("profile") != profile.pk or grant.get("hash") != pin_fingerprint(profile):
        raise PermissionDenied("Unlock this profile with its PIN first.")
